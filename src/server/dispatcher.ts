import * as WebSocket from 'ws';
import * as Message from '../model/message';
// import { ResultContainer, ResultObservable } from '../gpg/result';
import * as rxme from 'rxme';
// import { Observer } from './observer';

export class MessageSubject extends rxme.Subject<Message.Message> {

}
export class MessageObservable extends rxme.Observable<Message.Message> {
  // public static create(cb: (obs: rxme.Observer<Message.Message>) => void): MessageObservable {
  //   return rxme.Observable.create(Message.Message, cb);
  // }
}

export class Dispatcher {
  public readonly recv: MessageSubject;
  public readonly send: MessageSubject;
  constructor() {
    this.recv = new MessageSubject(Message.Message);
    this.send = new MessageSubject(Message.Message);
  }
}

export default Dispatcher;
