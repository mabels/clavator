import * as React from 'react';
import * as ReactModal from 'react-modal';
import * as Message from '../message';
import * as WsChannel from './ws-channel';
import { Progressor } from './progressor';
import * as CopyToClipboard from 'react-copy-to-clipboard';
import * as ListSecretKeys from '../gpg/list_secret_keys';
import ReadAsciiRespond from './read-ascii-respond';


interface DialogRenderAsciiState {
  transaction: Message.Transaction<any>
}

interface DialogRenderAsciiProps extends React.Props<DialogRenderAscii> {
  onClose: () => void,
  channel: WsChannel.Dispatch
  secKey: ListSecretKeys.Key;
  action: string;
}

export class DialogRenderAscii extends React.Component<DialogRenderAsciiProps, DialogRenderAsciiState> {

  constructor() {
    super();
    this.state = {
      transaction: Message.newTransaction("ResetYubikey")
    };
  }


public render(): JSX.Element {
    return (
      <ReactModal
        isOpen={true}
        closeTimeoutMS={150}
        onAfterOpen={() => { }}
        contentLabel="Modal"
      >
        <i onClick={this.props.onClose} className="closeBox fa fa-close"></i>
        <h4>{this.props.action}:{this.props.secKey.fingerPrint.fpr}</h4>
        <ReadAsciiRespond 
          action={this.props.action}
          channel={this.props.channel}
          secKey={this.props.secKey}
         />
      </ReactModal>
    );
  }
}

export default DialogRenderAscii;