
// import * as React from 'react';
// import * as ReactDOM from 'react-dom';
import { observable, ObservableMap, IObservableArray, action } from 'mobx';

import { SecretKey }  from '../../gpg/types';
import { WsChannel, Dispatch } from './ws-channel';
import { Message } from '../../model';

export class KeyChainListState implements WsChannel {
  public readonly keyChainList: IObservableArray<SecretKey> = observable([]);
  public readonly adminPins: ObservableMap<string> = observable.map<string>();

  constructor(channel: Dispatch) {
    channel.register(this);
  }

  public onOpen(e: Event): void { /* */ }

  @action
  public onMessage(header: Message.Header, data: string): void {
    if (header.action == 'KeyChainList') {
      let ret = JSON.parse(data);
      console.log(`set KeyChainList:{ret.length}`);
      this.keyChainList.replace(ret);
    }
  }

  @action
  public onClose(e: CloseEvent): void {
    this.keyChainList.clear();
  }
}
