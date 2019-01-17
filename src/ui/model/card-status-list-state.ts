import { observable, ObservableMap } from 'mobx';
import { WsChannel, Dispatch } from './ws-channel';
import { Gpg2CardStatus } from '../../gpg';
import { Message } from '../../model';

// import DevTools from 'mobx-react-devtools';

export class CardStatusListState implements WsChannel {
  // @observable timer = 0;
  @observable public cardStatusList: Gpg2CardStatus[] = [];
  @observable public adminPins: ObservableMap<string> = observable.map<string>();

  constructor(channel: Dispatch) {
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
        let n = Gpg2CardStatus.jsfill(a);
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
