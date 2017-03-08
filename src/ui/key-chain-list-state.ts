
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable } from 'mobx';

import * as ListSecretKeys from '../gpg/list_secret_keys';
import { AdminPin, Pin } from '../gpg/pin';

import * as WsChannel from './ws-channel';
import * as Message from '../message';

// import DevTools from 'mobx-react-devtools';

export class KeyChainListState implements WsChannel.WsChannel {
  // @observable timer = 0;
  @observable keyChainList: ListSecretKeys.SecretKey[] = [];
  @observable adminPins = observable.map<string>()

  constructor(channel: WsChannel.Dispatch) {
    channel.register(this);
  }
  onOpen(e: Event) { }

  onMessage(action: Message.Header, data: string) {
    if (action.action == "KeyChainList") {
      // this.keyChainList.length = 0;
      let ret = JSON.parse(data);
      this.keyChainList = ret;
      console.log("KeyChainList", action, this.keyChainList)
    }
  }
  onClose(e: CloseEvent) {
    this.keyChainList.length = 0
  }
}
export default KeyChainListState;