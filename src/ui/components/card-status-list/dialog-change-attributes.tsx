import * as React from 'react';
import * as ReactModal from 'react-modal';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
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

  @observable
  public changeCard: ChangeCard;
  public transaction: Message.Transaction<ChangeCard>;

  constructor(props: DialogChangeAttributesProps) {
    super(props);
    this.transaction = Message.newTransaction<ChangeCard>('ChangeCard.Request');
  }

 public updateAttributes(): () => void {
    return (() => {
      this.transaction.data = this.changeCard;
      this.props.appState.channel.send(this.transaction.asMsg());
    }).bind(this);
  }

  public componentWillMount(): void {
    this.changeCard = ChangeCard.fromCardStatus(this.props.cardStatus);
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
        <h5>{this.changeCard.name}({this.changeCard.serialNo})</h5>
        {/*<form>*/}
        <label>AdminPin:</label><input type="password"
          name="admin-pin"
          className={classnames({ good: this.changeCard.adminPin.verify() })}
          onChange={(e: any) => {
            this.changeCard.adminPin.pin = e.target.value;
          }} />
        <label>Name of cardholder:</label><input type="text"
          onChange={(e: any) => {
            this.changeCard.name = e.target.value;
          }}
          value={this.changeCard.name} />
        <label>Language prefs:</label><input type="text"
          onChange={(e: any) => {
            this.changeCard.lang = e.target.value;
          }}
          value={this.changeCard.lang} />
        <label>Sex:</label><select value={this.changeCard.sex[0]}
          onChange={(e) => {
            this.changeCard.sex = e.target.value[0];
          }}>
          <option value={'f'}>Female</option>
          <option value={'m'}>Male</option>
        </select>
        <label>Login data:</label><input type="text"
          onChange={(e: any) => {
            this.changeCard.login = e.target.value;
          }}
          value={this.changeCard.login} />
        <label>Url:</label><input type="text"
          onChange={(e: any) => {
            this.changeCard.url = e.target.value;
          }}
          value={this.changeCard.url} />
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
