import * as WebSocket from 'ws';
import * as Message from '../model/message';
// import { ResultContainer, ResultObservable } from '../gpg/result';
import * as rxme from 'rxme';
import { Dispatch } from './dispatch';
// import { Observer } from './observer';

export class MessageSubject extends rxme.Subject {
}

export class MessageObservable extends rxme.Observable {
  // public static create(cb: (obs: rxme.Observer<Message.Message>) => void): MessageObservable {
  //   return rxme.Observable.create(Message.Message, cb);
  // }
}

export class Dispatcher {
  public readonly recv: MessageSubject;
  public readonly send: MessageSubject;

  public static match(cb: rxme.MatcherCallback<Dispatcher>): rxme.MatcherCallback {
    return rxme.Matcher.Type<Dispatcher>(Dispatcher, cb);
  }
  constructor() {
    this.recv = new MessageSubject();
    this.send = new MessageSubject();
  }
}

export default Dispatcher;
