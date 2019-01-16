
import * as React from 'react';
import * as ReactModal from 'react-modal';
import * as CardStatus from '../../../gpg/card-status';
import * as Message from '../../../model/message';
// import * as WsChannel from '../../model/ws-channel';
// import { Progressor } from './progressor';
import { ChangePin } from './change-pin';
import { observer } from 'mobx-react';
import AppState from '../../model/app-state';

interface DialogChangePinState {
  // transaction: Message.Transaction<any>;
}

interface DialogChangePinProps extends React.Props<DialogChangePin> {
  onClose: () => void;
  cardStatus: CardStatus.Gpg2CardStatus;
  appState: AppState;
  type: string;
}

@observer
export class DialogChangePin extends React.Component<DialogChangePinProps, DialogChangePinState> {

  constructor(props: DialogChangePinProps) {
    super(props);
    this.state = {
      // transaction: null
    };
  }

  public render(): JSX.Element {
    return (
      <ReactModal
        isOpen={true}
        closeTimeoutMS={150}
        contentLabel="Modal"
        shouldCloseOnOverlayClick={true}
      >
        <i style={{ float: 'right' }}
           onClick={this.props.onClose}
           className="fa fa-close"></i>
        <h4>ChangePin:{this.props.type}</h4>
        <h5>{this.props.cardStatus.name}({this.props.cardStatus.reader.cardid})</h5>
        <ChangePin type={this.props.type}
          appState={this.props.appState}
          app_id={this.props.cardStatus.reader.cardid} />
      </ReactModal>
    );
  }
}

export default DialogChangePin;
