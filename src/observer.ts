
import * as expressWsTs from 'express-ws';



import * as Message from './message';


import * as Gpg from './gpg/gpg';
import GpgListSecretKeysObserver from './gpg_list_secret_keys_observer'
import GpgCardStatusObserver from './gpg_card_status_observer'


export class Observer {
    public wss : expressWsTs.ExpressWebSocket[] = [];
    public gpgListSecretKeysObserver : GpgListSecretKeysObserver;
    public gpgCardStatusObserver : GpgCardStatusObserver;
    public register(ws: expressWsTs.ExpressWebSocket) {
      this.wss.push(ws);
      this.gpgListSecretKeysObserver.register(ws);
      this.gpgCardStatusObserver.register(ws);
    }

    public unregister(ws: expressWsTs.ExpressWebSocket) {
      this.wss = this.wss.filter(item => item !== ws);
    }

    public static start(gpg: Gpg.Gpg) : Observer {
      console.log("Observer.start");
      let obs = new Observer();
      obs.gpgListSecretKeysObserver = GpgListSecretKeysObserver.create(gpg, obs);
      obs.gpgCardStatusObserver = GpgCardStatusObserver.create(gpg, obs);
      return obs;
    }
}

export function start(gpg: Gpg.Gpg) : Observer {
    return Observer.start(gpg);
}
