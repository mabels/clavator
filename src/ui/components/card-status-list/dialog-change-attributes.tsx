import * as React from 'react';
import * as ReactModal from 'react-modal';
import * as CardStatus from '../../../gpg/card-status';
import * as Message from '../../../model/message';
// import * as WsChannel from '../../model/ws-channel';
// import { Progressor } from './progressor';
import ChangeCard from '../../../gpg/change-card';
import * as classnames from 'classnames';
import { observer } from 'mobx-react';
import ButtonToProgressor from '../controls/button-to-progressor';
import AppState from '../../model/app-state';

interface DialogChangeAttributesState {
  changeCard: ChangeCard;
  transaction: Message.Transaction<ChangeCard>;
}

interface DialogChangeAttributesProps extends React.Props<DialogChangeAttributes> {
  onClose: () => void;
  cardStatus: CardStatus.Gpg2CardStatus;
  appState: AppState;
}

@observer
export class DialogChangeAttributes extends React.Component<DialogChangeAttributesProps, DialogChangeAttributesState> {

  constructor(props: DialogChangeAttributesProps) {
    super(props);
    this.state = {
      changeCard: null,
      transaction: Message.newTransaction<ChangeCard>('ChangeCard.Request')
    };
  }

 public updateAttributes(): () => void {
    return (() => {
      this.state.transaction.data = this.state.changeCard;
      this.props.appState.channel.send(this.state.transaction.asMsg());
    }).bind(this);
  }

  public componentWillMount(): void {
    this.setState({ changeCard: ChangeCard.fromCardStatus(this.props.cardStatus) });
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
        <h5>{this.state.changeCard.name}({this.state.changeCard.serialNo})</h5>
        {/*<form>*/}
        <label>AdminPin:</label><input type="password"
          name="admin-pin"
          className={classnames({ good: this.state.changeCard.adminPin.verify() })}
          onChange={(e: any) => {
            this.state.changeCard.adminPin.pin = e.target.value;
            this.setState({changeCard: this.state.changeCard});
          }} />
        <label>Name of cardholder:</label><input type="text"
          onChange={(e: any) => {
            this.state.changeCard.name = e.target.value;
            this.setState({changeCard: this.state.changeCard});
          }}
          value={this.state.changeCard.name} />
        <label>Language prefs:</label><input type="text"
          onChange={(e: any) => {
            this.state.changeCard.lang = e.target.value;
            this.setState({changeCard: this.state.changeCard});
          }}
          value={this.state.changeCard.lang} />
        <label>Sex:</label><select value={this.state.changeCard.sex[0]}
          onChange={(e) => {
            this.state.changeCard.sex = e.target.value[0];
            this.setState({changeCard: this.state.changeCard});
          }}>
          <option value={'f'}>Female</option>
          <option value={'m'}>Male</option>
        </select>
        <label>Login data:</label><input type="text"
          onChange={(e: any) => {
            this.state.changeCard.login = e.target.value;
            this.setState({changeCard: this.state.changeCard});
          }}
          value={this.state.changeCard.login} />
        <label>Url:</label><input type="text"
          onChange={(e: any) => {
            this.state.changeCard.url = e.target.value;
            this.setState({changeCard: this.state.changeCard});
          }}
          value={this.state.changeCard.url} />
        <br />
        <ButtonToProgressor
          appState={this.props.appState}
          onClick={this.updateAttributes()}
          transaction={this.state.transaction}
          >Update</ButtonToProgressor>
      </ReactModal>
    );
  }
}

export default DialogChangeAttributes;
