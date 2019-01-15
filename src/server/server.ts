
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';

const DOMAIN = process.env.DOMAIN || 'clavator.com';
let privateKey: string = null;
let certificate: string = null;
try {
  privateKey = fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/privkey.pem`, 'utf8');
  certificate = fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/fullchain.pem`, 'utf8');
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

import * as Observer from './observer';
import * as Dispatch from './dispatch';
import * as Gpg from '../gpg/gpg';

import * as Message from '../model/message';

async function starter(): Promise<void> {
  let redirectPort = process.env.HTTPPORT || 8080;
  let applicationPort = process.env.PORT || 8443;
  if (process.getuid() == 0) {
    redirectPort = 80;
    applicationPort = process.env.PORT || 443;
  }

  const redirectHttp = express();
  redirectHttp.get('/*', (req, res, next) => res.redirect(`https://${DOMAIN}/`));
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

  const gpg = await Gpg.create();
  const cmd = [process.execPath, path.join(
    path.dirname(process.argv[process.argv.length - 1]), 'gpg-mock.js')];
  const cmdAgent = cmd.concat(['connect-agent']);

  gpg.setGpgCmd(cmd);
  gpg.setGpgAgentCmd(cmdAgent);

  gpg.setGpgCmd(cmd);

  const observer = Observer.start(gpg);
  const dispatch = Dispatch.start(gpg);

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
    observer.register(sock);
    sock.on('close', () => {
      console.log('close');
      observer.unregister(sock);
    });
    // ws.on('data', msg:any => console.log(msg));
    sock.on('message', (payload) => {
      let msg = Message.fromData(payload.toString());
      // console.log('onMessage')
      dispatch.run(observer, sock, msg);
    });
  });

  httpServer.on('request', app);
  httpServer.listen(applicationPort);
}

starter();
