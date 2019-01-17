
// import * as React from 'react';
// import * as ReactDOM from 'react-dom';
import { observable, ObservableMap } from 'mobx';

import { SecretKey }  from '../../gpg';
import { WsChannel, Dispatch } from './ws-channel';
import { Message } from '../../model';

export class KeyChainListState implements WsChannel {
  @observable public keyChainList: SecretKey[] = [];
  @observable public adminPins: ObservableMap<string> = observable.map<string>();

  constructor(channel: Dispatch) {
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
