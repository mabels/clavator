import * as React from 'react';
import './app.less';
//import KeyChainListState from './key-chain-list-state';

import * as CardStatus from '../gpg/card_status';

import * as Message from '../message';

import * as WsChannel from './ws-channel';

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
    this.setState(Object.assign({}, this.state, { secretKeys: [] }));
  }

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


  // public render_key(clazz: string, key: CardStatus.Gpg2CardStatus) : JSX.Element {
  //   //<td>{key.funky}</td>
  //   return (
  //     <tr className={clazz} key={key.key}>
  //   <td>{key.type}</td>
  //   <td>{key.trust}</td>
  //   <td>{key.cipher}</td>
  //   <td>{key.bits}</td>
  //   <td>{key.keyId}</td>
  //   <td>{this.format_date(key.created)}</td>
  //   <td>{this.format_date(key.expires)}</td>
  //   <td>{key.uses}</td>
  //     </tr>
  // );
  // }
  //
  // public render_uid(uid: ListSecretKeys.Uid) : JSX.Element {
  //   //<td>{this.format_date(uid.created)}</td>
  //   //<td>{uid.id}</td>
  //   return (
  //     <tr className="uid" key={uid.key}>
  //   <td>{uid.trust}</td>
  //   <td>{uid.name}</td>
  //   <td>{uid.email}</td>
  //   <td>{uid.comment}</td>
  //     </tr>
  // );
  // }
  //

  format_date(ticks: number) : JSX.Element {
    let d = new Date(1000*ticks);
    return (
      <span key={ticks}>
      {d.getFullYear()}-{d.getMonth() + 1}-{d.getDate()}
      </span>
    )
  }


  public render(): JSX.Element {
        // SecretKeys {this.state.cardStatusList.length || ""}
    return (
      <div className="CardStatusList">
        CardStatusList {this.state.cardStatusList.length || ""}
        {this.state.cardStatusList.map((cs: CardStatus.Gpg2CardStatus, idx : number) => {
          return (<table key={cs.serial}>
            <tbody>
            <tr key={cs.serial}>
            <td>{cs.serial}</td>
            <td>{cs.name}</td>
            <td>{cs.login}</td>
            <td>{cs.lang}</td>
            <td>{cs.sex}</td>
            <td>{cs.url}</td>
            <td>{cs.version}</td>
            <td>{cs.vendor}</td>
            <td>
              {cs.reader.cardid}<br/>
              {cs.reader.model}<br/>
              {cs.reader.type}<br/>
            </td>
            <td>
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
            <td>{this.format_date(ks.fprtime)}</td>
            </tr>
              );
            })}
            </tbody>
            </table>
            </td>
            <td>{cs.forcepin}</td>
            <td>{cs.sigcount}</td>
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
