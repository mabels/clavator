import * as React from 'react';
import * as ReactModal from 'react-modal';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import classnames from 'classnames';

import {
  Gpg2CardStatus,
  ChangeCard } from '../../../gpg/types';

import { Message } from '../../../model';
import { AppState } from '../../model';
import { ButtonToProgressor } from '../controls';

interface DialogChangeAttributesProps extends React.Props<DialogChangeAttributes> {
  onClose: () => void;
  cardStatus: Gpg2CardStatus;
  appState: AppState;
}

@observer
export class DialogChangeAttributes extends React.Component<DialogChangeAttributesProps, {}> {

  public readonly changeCard: ChangeCard;
  public readonly transaction: Message.Transaction<ChangeCard>;

  constructor(props: DialogChangeAttributesProps) {
    super(props);
    this.transaction = Message.newTransaction<ChangeCard>('ChangeCard.Request');
    this.changeCard = ChangeCard.fromCardStatus(this.props.cardStatus);
  }

 public updateAttributes(): () => void {
    return (() => {
      this.transaction.data = this.changeCard;
      this.props.appState.channel.send(this.transaction.asMsg());
    }).bind(this);
  }

  public render(): JSX.Element {
    return (
      <ReactModal
        isOpen={true}
        closeTimeoutMS={150}
        contentLabel="Modal"
        shouldCloseOnOverlayClick={true}
      >
        <i style={{ float: 'right' }} onClick={this.props.onClose} className="closeBox fa fa-close"></i>
        <h4>ChangeAttributes:</h4>
        <h5>{this.changeCard.name.get()}({this.changeCard.serialNo.get()})</h5>
        {/*<form>*/}
        <label>AdminPin:</label><input type="password"
          name="admin-pin"
          className={classnames({ good: this.changeCard.adminPin.verify() })}
          onChange={action((e: any) => {
            this.changeCard.adminPin._pin.set(e.target.value);
          })} />
        <label>Name of cardholder:</label><input type="text"
          onChange={action((e: any) => {
            this.changeCard.name.set(e.target.value);
          })}
          value={this.changeCard.name.get()} />
        <label>Language prefs:</label><input type="text"
          onChange={action((e: any) => {
            this.changeCard.lang.set(e.target.value);
          })}
          value={this.changeCard.lang.get()} />
        <label>Sex:</label><select value={this.changeCard.sex.get()[0]}
          onChange={action((e: any) => {
            this.changeCard.sex.set(e.target.value[0]);
          })}>
          <option value={'f'}>Female</option>
          <option value={'m'}>Male</option>
        </select>
        <label>Login data:</label><input type="text"
          onChange={action((e: any) => {
            this.changeCard.login.set(e.target.value);
          })}
          value={this.changeCard.login.get()} />
        <label>Url:</label><input type="text"
          onChange={action((e: any) => {
            this.changeCard.url.set(e.target.value);
          })}
          value={this.changeCard.url.get()} />
        <br />
        <ButtonToProgressor
          appState={this.props.appState}
          onClick={this.updateAttributes()}
          transaction={this.transaction}
          >Update</ButtonToProgressor>
      </ReactModal>
    );
  }
}
