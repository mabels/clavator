
import * as WebSocket from 'ws';
import * as Message from './message';
import Dispatcher from './dispatcher'

import * as KeyGen from './gpg/key-gen';
import * as ListSecretKeys from './gpg/list_secret_keys';
import * as Gpg from './gpg/gpg';

import * as Progress from './progress'

export class GpgCreateKeySet implements Dispatcher {
  gpg: Gpg.Gpg;
  constructor(gpg :Gpg.Gpg) {
      this.gpg = gpg
  }

  public createSubKeys(ws: WebSocket, cnt: number, fpr:
    string, ki: KeyGen.KeyGen, cb: () => void) {
    // console.log("createSubKeys:1", cnt, ki.subKeys.subKeys.length);
    if (cnt >= ki.subKeys.pallets.length) {
      // console.log("createSubKeys:2");
      cb();
      return;
    }
    ws.send(Message.prepare("Progressor.Clavator", Progress.info("create subKey:"+cnt)));
    // console.log("createSubKeys:3");
    this.gpg.createSubkey(fpr, ki, ki.subKeys.pallets[cnt], (res: Gpg.Result) => {
      // console.log("createSubKeys:4");
      ws.send(Message.prepare("Progressor.Clavator", Progress.info(res.stdOut)));
      ws.send(Message.prepare("Progressor.Clavator", Progress.error(res.stdErr)));
      // console.log("createSubKeys:5");
      this.createSubKeys(ws, cnt+1, fpr, ki, cb);
    });

  }

  public addUids(ws: WebSocket, cnt: number, fpr:
    string, ki: KeyGen.KeyGen, cb: () => void) {
    // console.log("createSubKeys:1", cnt, ki.subKeys.subKeys.length);
    if (cnt >= ki.uids.pallets.length) {
      cb();
      return;
    }
    ws.send(Message.prepare("Progressor.Clavator", Progress.info("create Uids:"+cnt)));
    this.gpg.addUid(fpr, ki, ki.uids.pallets[cnt], (res: Gpg.Result) => {
      ws.send(Message.prepare("Progressor.Clavator", Progress.info(res.stdOut)));
      ws.send(Message.prepare("Progressor.Clavator", Progress.error(res.stdErr)));
      // console.log("createSubKeys:5");
      this.addUids(ws, cnt+1, fpr, ki, cb);
    });
  }



  public run(ws: WebSocket, m: Message.Message) : boolean {
    console.log("GpgCreateKeySet.run", m.header)
    if (m.header.action != "CreateKeySet") {
      // ws.send(Message.prepare("Progressor.Clavator", Progress.fail("Ohh")))
      return false;
    }
    let kg = new KeyGen.KeyGen();
    let a = JSON.parse(m.data) || {}
    KeyGen.KeyGen.fill(a, kg)
    // console.log(m, a, kg)
    // console.log(kg.valid(), kg.errText())
    if (!kg.valid()) {
      ws.send(Message.prepare("Progressor.Clavator", Progress.fail("Failed send KeyGen is not valid")))
      return;
    }
    // console.log(">>>", kg.masterCommand())
    ws.send(Message.prepare("Progressor.Clavator", Progress.info(kg.masterCommand())));
    this.gpg.createMasterKey(kg, (res: Gpg.Result) => {
      ws.send(Message.prepare("Progressor.Clavator", Progress.info(res.stdOut)));
      ws.send(Message.prepare("Progressor.Clavator", Progress.error(res.stdErr)));
      this.gpg.list_secret_keys((err: string, keys: ListSecretKeys.SecretKey[]) => {
        if (err) {
          console.error(err);
          return;
        }
        for(let key of keys) {
          for (let uid of key.uids) {
            if (uid.name == kg.uids.pallets[0].name.value && uid.email == kg.uids.pallets[0].email.value) {
              this.addUids(ws, 1, key.fingerPrint.fpr, kg, () => {
                this.createSubKeys(ws, 0, key.fingerPrint.fpr, kg, () => {
                  ws.send(Message.prepare("Progressor.Clavator", Progress.ok("KeysetCreated", true)));
                });
              });
            }
          }
        }
      });
      // this.gpg
    });
    // create master gpg --expert --gen-key
    // not here gpg --gen-revoke B8EFD59D
    // create subkey --edit-key ...
    // create subkey --edit-key ...
    // create subkey --edit-key ...
    // ws.send(Message.prepare("Progressor.Clavator", Progress.fail("Mhhh")))
    return true;
  }
  public static create(g: Gpg.Gpg) {
    return new GpgCreateKeySet(g)
  }
}

export default GpgCreateKeySet;
