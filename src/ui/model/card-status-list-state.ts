import { observable, ObservableMap, action } from 'mobx';
import { WsChannel, Dispatch } from './ws-channel';
import { Gpg2CardStatus } from '../../gpg/types';
import { Message } from '../../model';

// import DevTools from 'mobx-react-devtools';

export class CardStatusListState implements WsChannel {
  // @observable timer = 0;
  public readonly cardStatusList: Gpg2CardStatus[] = observable.array([]);
  public readonly adminPins: ObservableMap<string> = observable.map<string>();

  constructor(channel: Dispatch) {
    channel.register(this);
  }

  public onOpen(e: Event): void {
    return;
  }

  @action
  public onMessage(header: Message.Header, data: string): void {
    if (header.action == 'CardStatusList') {
      const pdata = JSON.parse(data);
      pdata.forEach((a: any, idx: number) => {
        let found = false;
        const n = Gpg2CardStatus.jsfill(a);
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
