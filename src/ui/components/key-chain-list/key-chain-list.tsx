import * as React from 'react';
import { observer } from 'mobx-react';

import { GpgKey, SecretKey } from '../../../gpg/types';
// import { RespondAscii, MutableString } from '../../../model';
import { AppState } from '../../model';
import { KeyChainListModal } from './key-chain-list-modal';
import { KeyChainListUid } from './key-chain-list-uid';
import { KeyChainListKey } from './key-chain-list-key';
import { observable, IObservableValue, IObservableArray } from 'mobx';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Card, CardHeader, CardContent } from '@material-ui/core';

export enum KeyChainListDialogs {
  closed,
  openAscii,
  askPassPhraseAscii,
  sendToCard
}

export interface KeyChainListProps extends React.Props<KeyChainList> {
  readonly appState: AppState;
}

export interface KeyChainDialogQItem {
  readonly dialogs: KeyChainListDialogs;
  readonly action: string;
  readonly secKey: SecretKey | GpgKey;
  readonly idx?: number;
}

@observer
export class KeyChainList extends React.Component<KeyChainListProps, {}> {
  public readonly dialogQ: IObservableArray<
    KeyChainDialogQItem
  > = observable.array();
  // public readonly dialogs: IObservableValue<KeyChainListDialogs>;
  // public readonly dialogSecKey: IObservableValue<SecretKey>;
  // public idx: number;
  // public readonly action: IObservableValue<string>;
  // public respondAscii?: RespondAscii;
  // public readonly passPhrase: IObservableValue<string>;

  constructor(props: KeyChainListProps) {
    super(props);
    // this.dialogs = observable.box(KeyChainListDialogs.closed);
    // this.dialogSecKey = observable.box(undefined);
    // this.action = observable.box();
    // this.passPhrase = observable.box(); // new MutableString();
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
      <>
        <KeyChainListModal
          dialogQ={this.dialogQ}
          appState={this.props.appState}
          /*
          dialogSecKey={this.dialogSecKey}
          idx={this.idx}
          action={this.action}
          passPhrase={this.passPhrase}
          */
        />
        {this.props.appState.keyChainListState.keyChainList.map(
          (secKey: SecretKey, idx: number) => {
            return (
              <Card>
                <CardHeader key={secKey.key}>
                  <Table>
                    <TableHead>
                      {secKey.uids.map(uid => (
                        <KeyChainListUid uid={uid} key={uid.id} />
                      ))}
                    </TableHead>
                  </Table>
                </CardHeader>

                <CardContent>
                  <Table>
                    <TableBody>
                      <KeyChainListKey
                        key={-1}
                        appState={this.props.appState}
                        dialogQ={this.dialogQ}
                        clazz="sec"
                        selectedKey={secKey}
                        idx={-1}
                      />
                      {secKey.subKeys.map((ssb, idxx) => (
                        <KeyChainListKey
                          key={idxx}
                          appState={this.props.appState}
                          dialogQ={this.dialogQ}
                          clazz="ssb"
                          selectedKey={ssb}
                          idx={idxx}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          }
        )}
      </>
    );
  }
}
