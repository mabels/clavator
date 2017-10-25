import * as React from 'react';
// import * as ReactModal from 'react-modal';
import * as CopyToClipboard from 'react-copy-to-clipboard';
import * as WsChannel from '../../model/ws-channel';
import * as ListSecretKeys from '../../../gpg/list-secret-keys';
import RequestAscii from '../../../model/request-ascii';
import RespondAscii from '../../../model/respond-ascii';
import MutableString from '../../../model/mutable-string';
import * as Message from '../../../model/message';

interface ReadAsciiRespondState {
  data: string;
  receiver: (action: Message.Header, data: string) => void;
  transaction: Message.Transaction<RequestAscii>;
}

interface ReadAsciiRespondProps extends React.Props<ReadAsciiRespond> {
  action: string;
  passPhrase?: MutableString;
  channel: WsChannel.Dispatch;
  secKey: ListSecretKeys.Key;
}

export class ReadAsciiRespond extends React.Component<ReadAsciiRespondProps, ReadAsciiRespondState> {

  constructor() {
    super();
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
    let transaction = Message.newTransaction<RequestAscii>('RequestAscii');
    this.setState({
      transaction: transaction,
      receiver: this.props.channel.onMessage((action: Message.Header, data: string) => {
        console.log('processAscii:', action, this.state.transaction);
        if (!(action.action == 'RespondAscii' &&
              action.transaction == this.state.transaction.header.transaction)) {
          return;
        }
        let pem = RespondAscii.fill(JSON.parse(data));
        if (this.props.secKey.fingerPrint.fpr != pem.fingerprint) {
          return;
        }
        console.log('Got: Respond:', pem);
        this.setState( { data: pem.data });
      })
    });
    this.props.channel.send(transaction.asMsg(ra));
  }

  public componentWillUnmount(): void {
    this.props.channel.unMessage(this.state.receiver);
  }

  public render(): JSX.Element {
    if (!this.state.data) {
      return <span>loading...</span>;
    } else {
      console.log('Render:', this.state);
      return (
        <div>
          <CopyToClipboard text={this.state.data}>
            <button>Copy to clipboard</button>
          </CopyToClipboard>
          <pre style={{ backgroundColor: '#ccc' }}>
            {this.state.data}
          </pre>
        </div>
      );
    }
  }
}

export default ReadAsciiRespond;
