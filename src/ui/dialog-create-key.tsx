
import * as React from 'react';

import * as classnames from 'classnames';

import './app.less';

import * as Message from '../message';

import * as WsChannel from './ws-channel';

import * as KeyGen from '../gpg/key-gen';

import * as ReactModal from 'react-modal';

import { Progressor } from './progressor';

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
        onAfterOpen={() => { }}
        contentLabel="Modal"
        shouldCloseOnOverlayClick={true}
      >
        <h4>Creating Key:</h4>
        <i onClick={(() => { this.setState({createDialog: false}); this.props.onClose(); }).bind(this)}
           className="closeBox fa fa-close"></i>
        <CreateKey channel={this.props.channel} />
      </ReactModal>
    )
  }
}

export default DialogCreateKey;