import * as React from 'react';
import { IObservableValue, action, observable } from 'mobx';
import { observer } from 'mobx-react';

import * as CopyToClipboard from 'react-copy-to-clipboard';

import { Dispatch } from '../../model';
import { GpgKey } from '../../../gpg/types';
import {
  RequestAscii,
  RespondAscii,
  Message
} from '../../../model';

export interface ReadAsciiRespondProps extends React.Props<ReadAsciiRespond> {
  readonly action: string;
  readonly passPhrase?: string;
  readonly channel: Dispatch;
  readonly secKey: GpgKey;
}

@observer
export class ReadAsciiRespond extends React.Component<
  ReadAsciiRespondProps,
  {}
> {
  public readonly data: IObservableValue<string>;
  public readonly transaction: Message.Transaction<RequestAscii>;
  public receiver: (action: Message.Header, data: string) => void;

  constructor(props: ReadAsciiRespondProps) {
    super(props);
    this.data = observable.box();
    this.transaction = Message.newTransaction<RequestAscii>('RequestAscii');
  }

  @action
  public componentWillMount(): void {
    console.log(`init ReadAsciiRespond`);
    this.receiver = this.props.channel.onMessage(
      action((header: Message.Header, data: string) => {
        if (
          !(
            header.action == 'RespondAscii' &&
            header.transaction == this.transaction.header.transaction
          )
        ) {
          return;
        }
        const pem = RespondAscii.fill(JSON.parse(data));
        if (this.props.secKey.fingerPrint.fpr != pem.fingerprint) {
          return;
        }
        this.data.set(pem.data);
      }
    ));
    const ra = new RequestAscii({
      action: this.props.action,
      fingerprint: this.props.secKey.fingerPrint.fpr,
      passphrase: this.props.passPhrase
    });
    this.props.channel.send(this.transaction.asMsg(ra));
  }

  public componentWillUnmount(): void {
    this.props.channel.unMessage(this.receiver);
  }

  public render(): JSX.Element {
    if (!this.data.get()) {
      return <span>loading...</span>;
    } else {
      return (
        <div>
          <CopyToClipboard text={this.data.get()}>
            <button>Copy to clipboard</button>
          </CopyToClipboard>
          <pre style={{ backgroundColor: '#ccc' }}>{this.data.get()}</pre>
        </div>
      );
    }
  }
}
