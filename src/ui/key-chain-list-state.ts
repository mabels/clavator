
// import * as React from 'react';
// import * as ReactDOM from 'react-dom';
import { observable, ObservableMap } from 'mobx';

import * as ListSecretKeys from '../gpg/list_secret_keys';
// import { AdminPin, Pin } from '../gpg/pin';

import * as WsChannel from './ws-channel';
import * as Message from '../message';

export class KeyChainListState implements WsChannel.WsChannel {
  @observable public keyChainList: ListSecretKeys.SecretKey[] = [];
  @observable public adminPins: ObservableMap<string> = observable.map<string>();

  constructor(channel: WsChannel.Dispatch) {
    channel.register(this);
  }

  public onOpen(e: Event): void { /* */ }

  public onMessage(action: Message.Header, data: string): void {
    if (action.action == 'KeyChainList') {
      let ret = JSON.parse(data);
      this.keyChainList = ret;
    }
  }
  public onClose(e: CloseEvent): void {
    this.keyChainList.length = 0;
  }
}

export default KeyChainListState;
