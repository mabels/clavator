import * as React from 'react';
import * as  ReactModal from 'react-modal';

import { GpgKey } from '../../../gpg/types';
import { Dispatch } from '../../model';
import { MutableString } from '../../../model';

import { AskPassphrase } from './ask-passphrase';
import { ReadAsciiRespond } from '../controls';
import { observable } from 'mobx';

interface DialogAskRenderAsciiProps extends React.Props<DialogAskRenderAscii> {
  onClose: () => void;
  secKey: GpgKey;
  channel: Dispatch;
  action: string;
}

export class DialogAskRenderAscii extends React.Component<DialogAskRenderAsciiProps, {}> {

  public passPhrase: MutableString;
  @observable
  public doRead: boolean;

  constructor(props: DialogAskRenderAsciiProps) {
    super(props);
    this.passPhrase = new MutableString();
    this.doRead = false;
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
          passphrase={this.passPhrase}
          fingerprint={this.props.secKey.fingerPrint.fpr}
          completed={(pp) => this.doRead = true}
          />
        {this.doRead ? <ReadAsciiRespond
          action="pem-private"
          secKey={this.props.secKey}
          channel={this.props.channel}
          passPhrase={this.passPhrase}
        /> : null}
      </ReactModal>
    );
  }
}
