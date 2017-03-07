
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable } from 'mobx';

import * as CardStatus from '../gpg/card_status';
import { AdminPin, Pin } from '../gpg/pin';

import * as WsChannel from './ws-channel';
import * as Message from '../message';

// import DevTools from 'mobx-react-devtools';

export class CardStatusListState implements WsChannel.WsChannel {
  // @observable timer = 0;
  @observable cardStatusList: CardStatus.Gpg2CardStatus[] = [];
  @observable adminPins = observable.map<string>()

  constructor(channel: WsChannel.Dispatch) {
    channel.register(this);
  }
  onOpen(e: Event) { }

  onMessage(action: Message.Header, data: string) {
    if (action.action == "CardStatusList") {
      this.cardStatusList = JSON.parse(data)
    }
  }
  onClose(e: CloseEvent) {
    this.cardStatusList = []
  }
}
export default CardStatusListState;