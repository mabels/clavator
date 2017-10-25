import * as React from 'react';
import * as WsChannel from '../../model/ws-channel';
import ReactModal from 'react-modal';
import CreateKey from './create-key';

interface DialogCreateKeyState {
}

interface DialogCreateKeyProps extends React.Props<DialogCreateKey> {
  channel: WsChannel.Dispatch;
  onClose: () => void;
}

export class DialogCreateKey extends React.Component<DialogCreateKeyProps, DialogCreateKeyState> {

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
        onAfterOpen={() => { /* */ }}
        contentLabel="Modal"
        shouldCloseOnOverlayClick={true}
      >
        <i onClick={
            (() => {
              this.setState({createDialog: false});
              this.props.onClose();
            }).bind(this)
          }
           className="closeBox fa fa-close"></i>
        <h4>Creating Key:</h4>
        <CreateKey channel={this.props.channel} />
      </ReactModal>
    );
  }
}

export default DialogCreateKey;
