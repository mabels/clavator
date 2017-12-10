
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
// import * as path from 'path';
import * as ListSecretKeys from '../gpg/list-secret-keys';
import * as CardStatus from '../gpg/card-status';

let privateKey: string = null;
let certificate: string = null;
try {
  privateKey = fs.readFileSync('/etc/letsencrypt/live/clavator.com/privkey.pem', 'utf8');
  certificate = fs.readFileSync('/etc/letsencrypt/live/clavator.com/fullchain.pem', 'utf8');
} catch (e) {
  /* */
}
const credentials = { key: privateKey, cert: certificate };

import { join } from 'path';
import * as express from 'express';
import * as ws from 'ws';
// const express: typeof expressTs = expressTs;
// import * as WebSocket from 'ws';
// const expressWs: typeof expressWsTs = expressWsTs;

import * as Monitor from './monitor';
import * as Dispatch from './dispatch';
import * as Gpg from '../gpg/gpg';

import * as Message from '../model/message';
import * as rxme from 'rxme';
import { ResultQueue, ResultExec } from '../gpg/result';
// import { WsChannel } from '../ui/model/ws-channel';
// import { CardStatusList } from '../ui/components/card-status-list';
// import { observe } from 'mobx/lib/api/observe';

function handleMonitor(sock: ws): (r: rxme.Container<any>) => void {
  return (result: rxme.Container<any>) => {
    if (result.isProgress()) {
      const header = Message.broadcast('Progressor.Clavator');
      if (result.progress instanceof ResultExec) {
        if (result.progress.exitCode) {
          sock.send(Message.prepare(header, result.progress));
        }
      } else {
        sock.send(Message.prepare(header, result.progress));
      }
      return;
    }
    if (result.isError()) {
      const header = Message.broadcast('Progressor.Clavator');
      sock.send(Message.prepare(header, result.nodeError));
      return;
    }
    if (result.data instanceof Array && result.data.length) {
      if (result.data[0] instanceof ListSecretKeys.SecretKey) {
        console.log('Monitor:message:ListSecretKeys.SecretKey', result.data);
        const header = Message.broadcast('KeyChainList');
        sock.send(Message.prepare(header, result.data));
      } else if (result.data[0] instanceof CardStatus.Gpg2CardStatus) {
        console.log('Monitor:message:CardStatus.Gpg2CardStatus', result.data);
        const header = Message.broadcast('CardStatusList');
        sock.send(Message.prepare(header, result.data));
      }
    }
  };
}

function starter(rq: ResultQueue): rxme.Observable<void> {
  return rxme.Observable.create(null, (obs: rxme.Observer<void>) => {
    let redirectPort = 8080;
    let applicationPort = process.env.PORT || 8443;
    if (process.getuid() == 0) {
      redirectPort = 80;
      applicationPort = process.env.PORT || 443;
    }

    const redirectHttp = express();
    redirectHttp.get('/*', (req, res, next) => {
      res.location('https://clavator.com');
      res.sendStatus(302);
      res.end('<a href="https://clavator.com">https://clavator.com</a>');
    });
    redirectHttp.listen(redirectPort);
    console.log(`Started redirectPort on ${redirectPort}`);

    let httpServer: https.Server | http.Server;
    if (privateKey) {
      httpServer = https.createServer(credentials);
      console.log(`Listen on: https ${applicationPort} ${process.env.PORT}`);
    } else {
      httpServer = http.createServer();
      console.log(`Listen on: http ${applicationPort} ${process.env.PORT}`);
    }

    const app = express();

    app.use(express.static(join(process.cwd(), 'dist')));

    Gpg.create(rq).match((_, rcgpg) => {
      // if (rcgpg.doProgress(obs)) { return; }
      // if (rcgpg.isError()) { return; }
      const monitor = Monitor.start(rcgpg);
      const dispatch = Dispatch.start(rcgpg);

      app.get('/', (req: express.Request, res: express.Response) => res.redirect('/index.html'));

      app.get('/privkey.pem', (req: express.Request, res: express.Response) => {
        if (privateKey) {
          res.send(privateKey);
        } else {
          res.sendStatus(404);
        }
      });
      app.get('/fullchain.pem', (req: express.Request, res: express.Response) => {
        if (certificate) {
          res.send(certificate);
        } else {
          res.sendStatus(404);
        }
      });

      let wss = new ws.Server({ server: httpServer });
      wss.on('connection', (sock) => {
        // var location = url.parse(ws.upgradeReq.url, true);
        // you might use location.query.access_token to authenticate or share sessions
        // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
        // ws.send('something');
        console.log('WS-Connect');
        const subMonitor = monitor.subscribe(handleMonitor(sock));
        // observer.register(sock);
        const recvSubject = dispatch.recv.subscribe(msg => {
          console.log('to-WS-recv:', msg.header);
          sock.send(msg.prepare());
        });
        sock.on('close', () => {
          console.log('close');
          subMonitor.unsubscribe();
          recvSubject.unsubscribe();
          // observer.unregister(sock);
        });
        // ws.on('data', msg:any => console.log(msg));
        sock.on('message', (payload) => {
          const msg = Message.fromData(payload.toString());
          console.log('from-WS-send:', msg.header);
          dispatch.send.next(msg);
        });
      });

      httpServer.on('request', app);
      httpServer.listen(applicationPort);
      return true;
    }).passTo();
  });
}

ResultQueue.create().match((_, rq) => {
  starter(rq).passTo();
  return true;
}).passTo();
