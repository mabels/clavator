import * as React from 'react';
import { observer } from 'mobx-react';

import { GpgKey, SecretKey } from '../../../gpg/types';
import { RespondAscii } from '../../../model';
import { AppState } from '../../model';
import { KeyChainListModal } from './key-chain-list-modal';
import { KeyChainListUid } from './key-chain-list-uid';
import { KeyChainListKey } from './key-chain-list-key';
import { observable, IObservableValue } from 'mobx';

export enum KeyChainListDialogs {
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

  public readonly dialogs: IObservableValue<KeyChainListDialogs>;
  public secKey: GpgKey;
  public appState: AppState;
  public idx: number;
  public action: IObservableValue<string>;
  public respondAscii?: RespondAscii;

  constructor(props: KeyChainListProps) {
    super(props);
    this.dialogs = observable.box(KeyChainListDialogs.closed);
  }

  /*

  /*

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
          dialogs={this.dialogs}
          secKey={this.secKey}
          appState={this.props.appState}
          idx={this.idx}
          action={this.action}
        />
        {this.props.appState.keyChainListState.keyChainList.map(
          (sk: SecretKey, idx: number) => {
            return (
              <div key={sk.key}>
                <table>{sk.uids.map(uid => <KeyChainListUid uid={uid} key={uid.id} />)}</table>
                <table>
                  <tbody>
                    <KeyChainListKey
                      key={-1}
                      appState={this.appState}
                      dialogs={this.dialogs}
                      action={this.action}
                      clazz="sec"
                      sk={sk}
                      gpgKey={sk}
                      idx={-1} />
                    {sk.subKeys.map((ssb, idxx) =>
                      <KeyChainListKey
                        key={idxx}
                        appState={this.appState}
                        dialogs={this.dialogs}
                        action={this.action}
                        clazz="ssb"
                        sk={sk}
                        gpgKey={ssb}
                        idx={idxx} />
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
