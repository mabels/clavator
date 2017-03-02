import * as React from 'react';
import './app.less';
//import KeyChainListState from './key-chain-list-state';

import * as CardStatus from '../gpg/card_status';

import FormatDate from './format-date'

import * as Message from '../message';

import * as WsChannel from './ws-channel';

import { ChangePin } from './change-pin';

import * as Gpg from '../gpg/gpg';

import {observer} from 'mobx-react';

import { CardStatusListState } from './card-status-list-state';

import EditableCard from './editable-card';

import { AskPassphrase } from './ask-passphrase';

interface CardStatusState {
  // currentAdminPin: string;
  // newPin: string;
  requestPin: string;
}
//export default KeyChainListState;

interface CardStatusListProps extends React.Props<CardStatusList> {
  channel: WsChannel.Dispatch;
  cardStatusListState: CardStatusListState;
}

@observer
export class CardStatusList
  extends React.Component<CardStatusListProps, CardStatusState> {

  constructor() {
    super();
    this.state = {
      // currentAdminPin: "12345678",
      // newPin: null,
      requestPin: null
    };

  }
  public static contextTypes = {
    socket: React.PropTypes.object
  };


  protected componentDidMount(): void {

  }

  protected componentWillUnmount(): void {
    // this.setState(Object.assign({}, this.state, { cardStatusList: [] }));
  }

  componentWillReceiveProps(nextProps: any, nextContext: any) {
    if (nextProps.channel) {
      nextProps.channel.register(this);
    }
  }

  public changePin(cs: CardStatus.Gpg2CardStatus, admin_or_user: string) {
    return ((e: any) => {
      if (this.state.requestPin && admin_or_user == this.state.requestPin) {
        this.setState(Object.assign({}, this.state, {
          requestPin: null
        }));
      } else {
        this.setState(Object.assign({}, this.state, {
          requestPin: admin_or_user
        }));
      }
    }).bind(this)
  }

  public resetYubikey(cs: CardStatus.Gpg2CardStatus) {
    return ((e: any) => {
      if (confirm(`you real want to delete this yubikey ${cs.serial}?`)) {
        this.props.channel.send(Message.prepare("ResetYubikey"), (error: any) => {
          // fixme progressor
        });
      }
    }).bind(this)
  }

  public render_actions(cs: CardStatus.Gpg2CardStatus): JSX.Element {
    return (<td className="action">
      <a title="change-user-pin"
        onClick={this.changePin(cs, "unblock")}
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

  public render_action(cs: CardStatus.Gpg2CardStatus): JSX.Element {
    if (this.state.requestPin) {
      return (<tr>
        <td colSpan={10}>
          Change Pin {this.state.requestPin}
          <ChangePin type={this.state.requestPin}
            channel={this.props.channel}
            app_id={cs.reader.cardid} />
        </td>
      </tr>);
    } else {
      // if (this.state.changeAdminPin) {
      //     return (<ChangePin pin={this.state.changeAdminPin}/>)
      // }
      // if (this.state.changeUserPin) {
      //     return (<ChangePin pin={this.state.changeUserPin}/>)
      // }
      return null
    }
  }

  public render(): JSX.Element {
    return (
      <div className="CardStatusList">
        {this.props.cardStatusListState.cardStatusList.map((cs: CardStatus.Gpg2CardStatus, idx: number) => {
          console.log("Render", cs.serial);
          let login = ""+cs.login;
          return (<table key={cs.serial}>
            <tbody>
              <tr key={cs.serial}>
                {this.render_actions(cs)}
                <td>{cs.serial}</td>
                <td><EditableCard 
                    cardStatusListState={this.props.cardStatusListState}
                    serialNo={cs.reader.cardid}
                    channel={this.props.channel} action={"name"} value={cs.name} >
                      <input defaultValue={cs.name.split(/\s+/)[0]} />
                      <input defaultValue={cs.name.split(/\s+/).slice(1).join(" ")} />
                    </EditableCard>
                </td>
                <td><EditableCard 
                    cardStatusListState={this.props.cardStatusListState}
                    serialNo={cs.reader.cardid}
                    channel={this.props.channel} action={"login"} value={cs.login} >
                      <input defaultValue={login} />
                    </EditableCard>
                </td>
                <td><EditableCard 
                    cardStatusListState={this.props.cardStatusListState}
                    serialNo={cs.reader.cardid}
                    channel={this.props.channel} action={"lang"} value={cs.lang}>
                      <input defaultValue={cs.lang} />
                    </EditableCard>
                </td>
                <td><EditableCard 
                    cardStatusListState={this.props.cardStatusListState}
                    serialNo={cs.reader.cardid}
                    channel={this.props.channel} action={"sex"} value={cs.sex} >
                      <select value={cs.sex[0] == "m" ? 1 : 2}
                        onChange={function(e) { 
                          this.setState({value: e.target.value});
                        }}> 
                        <option value={2}>Female</option>
                        <option value={1}>Male</option>
                      </select>
                    </EditableCard>
                </td>
              </tr>
              {this.render_action(cs)}
              <tr>
                <td>{cs.url}</td>
                <td>{cs.version}</td>
                <td>{cs.vendor}</td>
                <td>
                  {cs.reader.cardid}<br />
                  {cs.reader.model}<br />
                  {cs.reader.type}<br />
                </td>
                <td>{cs.forcepin}</td>
                <td>{cs.sigcount}</td>
              </tr>
              <tr>
                <td colSpan={11}>
                  <table>
                    <tbody>
                      {cs.keyStates.map((ks: CardStatus.KeyState, idx: number) => {
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
                            <td><FormatDate ticks={ks.fprtime} /></td>
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

