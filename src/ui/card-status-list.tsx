import * as React from 'react';
import './app.less';
//import KeyChainListState from './key-chain-list-state';

import * as CardStatus from '../gpg/card_status';

import FormatDate from './format-date'

import * as Message from '../message';

import * as WsChannel from './ws-channel';

import { ResetYubikey } from './reset-yubikey';
import { ChangePin } from './change-pin';


interface CardStatusState {
  cardStatusList: CardStatus.Gpg2CardStatus[];
}
//export default KeyChainListState;

interface CardStatusListProps extends React.Props<CardStatusList> {
  channel: WsChannel.Dispatch;
}

export class CardStatusList
  extends React.Component<CardStatusListProps, CardStatusState>
  implements WsChannel.WsChannel
{

  constructor() {
    super();
    this.state = {
      cardStatusList: []
    };

  }
  public static contextTypes = {
   socket: React.PropTypes.object
  };


  protected componentDidMount(): void {

  }

  protected componentWillUnmount(): void {
    this.setState(Object.assign({}, this.state, { cardStatusList: [] }));
  }

  onOpen(e: Event) {}

  onMessage(action: Message.Header, data: string) {
    if (action.action == "CardStatusList") {
      this.setState(Object.assign({}, this.state, {
        cardStatusList: JSON.parse(data)
      }));
    }
  }
  onClose(e:CloseEvent) {
    this.setState(Object.assign({}, this.state, { cardStatusList: [] }));
  }


  componentWillReceiveProps(nextProps: any, nextContext: any) {
    if (nextProps.channel) {
      nextProps.channel.register(this);
    }
  }

  shouldComponentUpdate(nextProps: any,  nextState: any,  nextContext: any) : boolean {
    // debugger
    return true;
  }

  componentWillUpdate(nextProps: any, nextState: any, nextContext: any) {
    // debugger
  }

  componentDidUpdate(prevProps: any, prevState: any, prevContext: any) {
    // debugger
  }

  public changePin(cs: CardStatus.Gpg2CardStatus, admin_or_user : string) {
      return ((e: any) => {

      }).bind(this)
  }

  public resetYubikey(cs: CardStatus.Gpg2CardStatus) {
      return ((e: any) => {

      }).bind(this)
  }

  public render_actions(cs: CardStatus.Gpg2CardStatus) : JSX.Element {
    return (<td className="action">
      <a title="change-user-pin"
         onClick={this.changePin(cs, "user")} 
         name="change-user-pin">
        <i className="fa fa-user"></i>
      </a>
      <a title="change-admin-pin"
        onClick={this.changePin(cs, "admin")} 
        name="change-admin-pin">
       <i className="fa fa-superpowers"></i>
      </a>
      <a title="reset-yubikey"
        onClick={this.resetYubikey(cs)} 
        name="reset-yubikey">
        <i className="fa fa-trash"></i>
      </a>
    </td>);
  }

  public render_action() : JSX.Element {
      // if (this.state.changeAdminPin) {
      //     return (<ChangePin pin={this.state.changeAdminPin}/>)
      // }
      // if (this.state.changeUserPin) {
      //     return (<ChangePin pin={this.state.changeUserPin}/>)
      // }
      // if (this.state.resetYubikey) {
      //     return (<ResetYubikey />)
      // }
      return null
  }



  public render(): JSX.Element {
        // SecretKeys {this.state.cardStatusList.length || ""}
        // CardStatusList {this.state.cardStatusList.length || ""}
      //   <tr>
      //   <div className={classnames({row: true, good: this.state.keyGen.adminPin.valid()})}>
      //  {this.render_password("AdminPin", "cq-adminpin", this.state.keyGen.adminPin)}
      //  {this.render_verify_password("AdminPin", "cq-adminpin", this.state.keyGen.adminPin)}
      //  </div>
      //   <div className={classnames({row: true, good: this.state.keyGen.userPin.valid()})}>
      //  {this.render_password("UserPin", "cq-userpin", this.state.keyGen.userPin)}
      //  {this.render_verify_password("UserPin", "cq-userpin", this.state.keyGen.userPin)}
      //  </div>
      //   </tr>
    return (
      <div className="CardStatusList">

        {this.state.cardStatusList.map((cs: CardStatus.Gpg2CardStatus, idx : number) => {
          return (<table key={cs.serial}>
            <tbody>
            <tr key={cs.serial}>
            {this.render_actions(cs)}
            <td>{cs.serial}</td>
            <td>{cs.name}</td>
            <td>{cs.login}</td>
            <td>{cs.lang}</td>
            <td>{cs.sex}</td>
            </tr>
            {this.render_action()}
            <tr>
            <td>{cs.url}</td>
            <td>{cs.version}</td>
            <td>{cs.vendor}</td>
            <td>
              {cs.reader.cardid}<br/>
              {cs.reader.model}<br/>
              {cs.reader.type}<br/>
            </td>
            <td>{cs.forcepin}</td>
            <td>{cs.sigcount}</td>
            </tr>
            <tr>
              <td colSpan={11}>
                <table>
                  <tbody>
                  {cs.keyStates.map((ks: CardStatus.KeyState, idx : number) => {
                    return (
                        <tr key={ks.id}>
                          <td>{ks.id}</td>
                          <td>{ks.mode}</td>
                          <td>{ks.bits}</td>
                          <td>{ks.maxpinlen}</td>
                          <td>{ks.pinretry}</td>
                          <td>{ks.sigcount}</td>
                          <td>{ks.cafpr}</td>
                          <td>{ks.fpr}</td>
                          <td><FormatDate ticks={ks.fprtime}/></td>
                        </tr>
                    );
                  })}
                  </tbody>
                </table>
              </td>
            </tr>
            </tbody>
          </table>);
        })}
      </div>
    );
  }

}

// {this.render_key(sk)}
// <li>
// <ul>
// </ul>
// </li>
// <li>
// <ul>
// {sk.subKeys.map((ssb) => <li key={ssb.key}>{this.render_key(ssb)}</li> )}
// </ul>
// </li>
// </li>)}
