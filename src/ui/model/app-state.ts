
import * as WsChannel from '../model/ws-channel';
import { CardStatusListState } from './card-status-list-state';
import { KeyChainListState } from './key-chain-list-state';
import { ProgressorState } from '../components/controls/progressor';
import { AssistentState } from '../components/assistent';
import { observable } from 'mobx';

export class AppState {
      public readonly channel: WsChannel.Dispatch;
      public readonly cardStatusListState: CardStatusListState;
      public readonly keyChainListState: KeyChainListState;
      public readonly progressorState: ProgressorState;
      public readonly assistentState: AssistentState;

      public static create(): AppState {
            return new AppState();
      }

      private constructor() {
            this.channel = WsChannel.Dispatch.create();
            this.cardStatusListState = new CardStatusListState(this.channel);
            this.keyChainListState = new KeyChainListState(this.channel);
            this.progressorState = new ProgressorState(this.channel);
            this.assistentState = new AssistentState();
      }
}
