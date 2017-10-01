import { observable, ObservableMap } from 'mobx';
import * as CardStatus from '../gpg/card_status';
import * as WsChannel from './ws-channel';
import * as Message from '../message';

// import DevTools from 'mobx-react-devtools';

export class CardStatusListState implements WsChannel.WsChannel {
  // @observable timer = 0;
  @observable public cardStatusList: CardStatus.Gpg2CardStatus[] = [];
  @observable public adminPins: ObservableMap<string> = observable.map<string>();

  constructor(channel: WsChannel.Dispatch) {
    channel.register(this);
  }
  public onOpen(e: Event): void {
    return;
  }

  public onMessage(action: Message.Header, data: string): void {
    if (action.action == 'CardStatusList') {
      let pdata = JSON.parse(data);
      pdata.forEach((a: any, idx: number) => {
        let found = false;
        let n = CardStatus.Gpg2CardStatus.jsfill(a);
        this.cardStatusList.forEach((csl) => {
          if (csl.reader.eq(n.reader)) {
            csl.jsfill(a);
            console.log('onMessage:CardStatusList:update:', csl);
            found = true;
          }
        });
        if (!found) {
          console.log('onMessage:CardStatusList:push:', n);
          this.cardStatusList.push(n);
        }
      });
      if (this.cardStatusList.length != pdata.length) {
        console.log('onMessage:CardStatusList:len:', pdata.length);
        this.cardStatusList.length = pdata.length;
      }
      // console.log("DATA", this.cardStatusList, data)
    }
  }
  public onClose(e: CloseEvent): void {
    this.cardStatusList.length = 0; // = [];
  }
}
export default CardStatusListState;
