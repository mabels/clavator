import * as React from 'react';
// import * as ReactModal from 'react-modal';
import * as CopyToClipboard from 'react-copy-to-clipboard';

import { Dispatch } from '../../model';
import { GpgKey } from '../../../gpg';
import {
  RequestAscii,
  RespondAscii,
  MutableString,
  Message,
} from '../../../model';
import { observable } from 'mobx';

export interface ReadAsciiRespondProps extends React.Props<ReadAsciiRespond> {
  action: string;
  passPhrase?: MutableString;
  channel: Dispatch;
  secKey: GpgKey;
}

export class ReadAsciiRespond extends React.Component<
  ReadAsciiRespondProps,
  {}
> {
  @observable
  public data: string;
  public receiver: (action: Message.Header, data: string) => void;
  public transaction: Message.Transaction<RequestAscii>;

  constructor(props: ReadAsciiRespondProps) {
    super(props);
    this.state = {
      data: null,
      receiver: null,
      transaction: null
    };
  }

  public componentWillMount(): void {
    let ra = new RequestAscii();
    ra.action = this.props.action;
    ra.fingerprint = this.props.secKey.fingerPrint.fpr;
    ra.passphrase = this.props.passPhrase;
    this.transaction = Message.newTransaction<RequestAscii>('RequestAscii');
    this.receiver = this.props.channel.onMessage(
        (action: Message.Header, data: string) => {
          console.log('processAscii:', action, this.transaction);
          if (
            !(
              action.action == 'RespondAscii' &&
              action.transaction == this.transaction.header.transaction
            )
          ) {
            return;
          }
          let pem = RespondAscii.fill(JSON.parse(data));
          if (this.props.secKey.fingerPrint.fpr != pem.fingerprint) {
            return;
          }
          console.log('Got: Respond:', pem);
          this.data = pem.data;
        }
      );
    this.props.channel.send(this.transaction.asMsg(ra));
  }

  public componentWillUnmount(): void {
    this.props.channel.unMessage(this.receiver);
  }

  public render(): JSX.Element {
    if (!this.data) {
      return <span>loading...</span>;
    } else {
      console.log('Render:', this.state);
      return (
        <div>
          <CopyToClipboard text={this.data}>
            <button>Copy to clipboard</button>
          </CopyToClipboard>
          <pre style={{ backgroundColor: '#ccc' }}>{this.data}</pre>
        </div>
      );
    }
  }
}
