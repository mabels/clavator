import * as React from 'react';
import ReactModal from 'react-modal';
// import * as CopyToClipboard from 'react-copy-to-clipboard';
import { AskPassphrase } from './ask-passphrase';
import * as ListSecretKeys from '../gpg/list_secret_keys';
import * as WsChannel from './ws-channel';
// import { CardStatusListState } from './card-status-list-state';
import MutableString from '../gpg/mutable_string';
import ReadAsciiResponse from './read-ascii-respond';

interface DialogAskRenderAsciiState {
  passPhrase: MutableString;
  doRead: boolean;
}

interface DialogAskRenderAsciiProps extends React.Props<DialogAskRenderAscii> {
  onClose: () => void;
  secKey: ListSecretKeys.Key;
  channel: WsChannel.Dispatch;
  action: string;
}

export class DialogAskRenderAscii extends React.Component<DialogAskRenderAsciiProps, DialogAskRenderAsciiState> {

  constructor() {
    super();
    this.state = {
      passPhrase: new MutableString(),
      doRead: false
    };
  }

  public render(): JSX.Element {
    return (
      <ReactModal
        isOpen={true}
        closeTimeoutMS={150}
        onAfterOpen={() => { /* */ }}
        contentLabel="Modal"
      >
        <i style={{ float: 'right' }} onClick={this.props.onClose} className="closeBox fa fa-close"></i>
        <h4>{this.props.action}:{this.props.secKey.fingerPrint.fpr}</h4>
        <AskPassphrase
          passphrase={this.state.passPhrase}
          fingerprint={this.props.secKey.fingerPrint.fpr}
          completed={(pp) => this.setState({doRead: true })}
          />
        {this.state.doRead ? <ReadAsciiResponse
          action="pem-private"
          secKey={this.props.secKey}
          channel={this.props.channel}
          passPhrase={this.state.passPhrase}
        /> : null}
      </ReactModal>
    );
  }
}
export default DialogAskRenderAscii;
