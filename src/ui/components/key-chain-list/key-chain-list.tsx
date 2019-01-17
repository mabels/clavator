import * as React from 'react';
import { observer } from 'mobx-react';

import { GpgUid, GpgKey, SecretKey } from '../../../gpg';
import { RequestAscii, MutableString, RespondAscii, Message } from '../../../model';
import { AppState, WsMessage } from '../../model';
import { FormatDate } from '../controls';
import { DialogSendToCard } from './dialog-send-to-card';
import { DialogRenderAscii } from './dialog-render-ascii';
import { DialogAskRenderAscii } from './dialog-ask-render-ascii';
import { Buttons } from '../buttons';
import { KeyChainListModal } from './key-chain-list-modal';
import { KeyChainListUid } from './key-chain-list-uid';
import { KeyChainListKey } from './key-chain-list-key';
import { observable } from 'mobx';

export enum Dialogs {
  closed,
  openAscii,
  askPassPhraseAscii,
  sendToCard
}

export interface KeyChainListProps extends React.Props<KeyChainList> {
  appState: AppState;
}

@observer
export class KeyChainList extends React.Component<
  KeyChainListProps,
  {}
> {

  @observable
  public dialog: Dialogs;
  public secKey: GpgKey;
  public appState: AppState;
  public idx: number;
  public action: string;
  @observable
  public respondAscii?: RespondAscii;

  constructor(props: KeyChainListProps) {
    super(props);
    this.dialog = Dialogs.closed;
  }

  /*
  private processAscii(
    key: GpgKey,
    action: string,
    dialog: Dialogs,
    pp: string = null
  ): void {
    let ra = new RequestAscii();
    ra.action = action;
    ra.fingerprint = key.fingerPrint.fpr;
    ra.passphrase = new MutableString();
    ra.passphrase.value = pp;
    this.setState(
      Object.assign({}, this.state, {
        dialog: dialog,
        action: action,
        key: key,
        respondAscii: null,
        receiver: this.props.appState.channel.onMessage(
          (actionx: Message.Header, data: string) => {
            console.log('processAscii:', actionx);
            if (actionx.action != 'RespondAscii') {
              return;
            }
            const pem = RespondAscii.fill(JSON.parse(data));
            if (key.fingerPrint.fpr != pem.fingerprint) {
              return;
            }
            console.log('Got: Respond:', pem);
            this.respondAscii = pem;
          }
        )
      })
    );
    this.props.appState.channel.send(
      Message.newTransaction('RequestAscii', ra).asMsg()
    );
  }

  /*
  private requestAscii(
    key: GpgKey,
    action: string
  ): React.EventHandler<React.MouseEvent<HTMLAnchorElement>> {
    return (() => {
      this.processAscii(key, action, Dialogs.openAscii);
    }).bind(this);
  }

  private requestAsciiWithPassphrase(
    key: GpgKey,
    action: string
  ): React.EventHandler<React.MouseEvent<HTMLAnchorElement>> {
    return (() => {
      this.setState(
        Object.assign({}, this.state, {
          dialog: Dialogs.askPassPhraseAscii,
          action: action,
          key: key,
          passPhrase: new MutableString(),
          respondAscii: null
        })
      );
    }).bind(this);
  }

  public deleteSecretKey(
    key: SecretKey
  ): React.EventHandler<React.MouseEvent<HTMLAnchorElement>> {
    return (() => {
      if (confirm(`Really delete ${key.keyId} <${key.uids[0].email}>?`)) {
        this.props.appState.channel.send(
          Message.newTransaction('DeleteSecretKey', key.fingerPrint).asMsg()
        );
      }
    }).bind(this);
  }

  /*
  public closeAsciiModal(): void {
    this.props.appState.channel.unMessage(this.state.receiver);
    this.setState(
      Object.assign({}, this.state, {
        dialog: Dialogs.closed,
        action: null,
        key: null,
        receiver: null,
        respondAscii: null
      })
    );
  }
  */

  public render(): JSX.Element {
    // SecretKeys {this.state.secretKeys.length || ""}
    // {/*{sk.subKeys.map((ssb, idx) => this.render_result(ssb, idx))}*/}
    // console.log("render.KeyChainList", this.props.keyChainListState.keyChainList.length)
    return (
      <div className="KeyChainList">
        <KeyChainListModal
          dialog={}
          secKey={}
          appState={this.props.appState}
          idx={}
          action={}
        />
        {this.props.appState.keyChainListState.keyChainList.map(
          (sk: SecretKey, idx: number) => {
            return (
              <div key={sk.key}>
                <table>{sk.uids.map(uid => <KeyChainListUid uid={uid} />)}</table>
                <table>
                  <tbody>
                    <KeyChainListKey clazz="sec" sk={sk} gpgKey={sk} idx={-1} />
                    {sk.subKeys.map((ssb, idxx) =>
                      <KeyChainListKey clazz="ssb" sk={sk} gpgKey={ssb} idx={idxx} />
                    )}
                  </tbody>
                </table>
              </div>
            );
          }
        )}
      </div>
    );
  }
}
