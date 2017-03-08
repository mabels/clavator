
import * as React from 'react';
import * as ReactModal from 'react-modal';
import * as CopyToClipboard from 'react-copy-to-clipboard';
import { AskKeyToYubiKey } from './ask-key-to-yubi-key';
import * as ListSecretKeys from '../gpg/list_secret_keys';
import * as WsChannel from './ws-channel';
import { CardStatusListState } from './card-status-list-state';


interface DialogSendToCardState {
}

interface DialogSendToCardProps extends React.Props<DialogSendToCard> {
  onClose: () => void;
  secKey: ListSecretKeys.Key;
  idx: number;
  channel: WsChannel.Dispatch;
  cardStatusListState: CardStatusListState;
}

export class DialogSendToCard extends React.Component<DialogSendToCardProps, DialogSendToCardState> {

  constructor() {
    super();
    this.state = {
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
        <i style={{ float: "right" }} onClick={this.props.onClose} className="fa fa-close"></i>
        <h4>SendKeyToCard</h4>
        {this.props.secKey.fingerPrint.fpr}
        <AskKeyToYubiKey
          slot_id={this.props.idx + 1}
          fingerprint={this.props.secKey.fingerPrint.fpr}
          channel={this.props.channel}
          cardStatusListState={this.props.cardStatusListState}
        />
      </ReactModal>

    );
  }

}
export default DialogSendToCard;