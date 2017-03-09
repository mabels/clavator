
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';


let privateKey: string = null;
let certificate: string = null;
try {
  privateKey = fs.readFileSync('/etc/letsencrypt/live/clavator.com/privkey.pem', 'utf8');
  certificate = fs.readFileSync('/etc/letsencrypt/live/clavator.com/fullchain.pem', 'utf8');
} catch (e) {
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
import * as Gpg from './gpg/gpg';

import * as Message from './message';

let redirectPort = 8080;
let applicationPort = 8443;
if (process.getuid() == 0) {
  redirectPort = 80;
  applicationPort = 443;
}

const redirectHttp = express();
redirectHttp.get("/*", (req, res, next) => {
  res.location('https://clavator.com');
  res.sendStatus(302);
  res.end('<a href="https://clavator.com">https://clavator.com</a>');
});
redirectHttp.listen(redirectPort);
console.log(`Started redirectPort on ${redirectPort}`)


let httpServer: https.Server | http.Server;
if (privateKey) {
  httpServer = https.createServer(credentials);
  console.log(`Listen on: https ${applicationPort}`)
} else {
  httpServer = http.createServer();
  console.log(`Listen on: http ${applicationPort}`)
}

const app = express();

app.use(express.static(join(process.cwd(), 'dist')));

let gpg = new Gpg.Gpg();
let cmd = [process.execPath, path.join(
  path.dirname(process.argv[process.argv.length - 1]), "gpg-mock.js")];
let cmdAgent = cmd.concat(["AGENT"]);
// if (fs.existsSync("/usr/bin/gpg")) {
//   cmd = ["/usr/bin/gpg"];
//   cmdAgent = ["/usr/bin/gpg-connect-agent"];
// }
// if (fs.existsSync("/usr/bin/gpg2")) {
//   cmd = ["/usr/bin/gpg2"];
//   cmdAgent = ["/usr/bin/gpg-connect-agent"];
// }
// if (fs.existsSync("/usr/local/bin/gpg")) {
//   cmd = ["/usr/local/bin/gpg"];
//   cmdAgent = ["/usr/local/bin/gpg-connect-agent"];
// }
// if (fs.existsSync("/usr/local/bin/gpg2")) {
//   cmd = ["/usr/local/bin/gpg2"];
//   cmdAgent = ["/usr/local/bin/gpg-connect-agent"];
// }
// if (fs.existsSync("../gpg/gnupg/g10/gpg")) {
//   cmd = ["../gpg/gnupg/g10/gpg"];
//   cmdAgent = ["../gpg/gnupg/tools/gpg-connect-agent"];
// }
// if (fs.existsSync("/gnupg/g10/gpg")) {
//   cmd = ["/gnupg/g10/gpg"];
//   cmdAgent = ["/gnupg/tools/gpg-connect-agent"];
// }
gpg.setGpgCmd(cmd);
gpg.setGpgAgentCmd(cmdAgent);

console.log(`Use GPG ${cmd}`)
gpg.setGpgCmd(cmd);

let observer = Observer.start(gpg);
let dispatch = Dispatch.start(gpg);

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

let wss = new ws.Server({ server: httpServer })
wss.on('connection', (ws) => {
  //var location = url.parse(ws.upgradeReq.url, true);
  // you might use location.query.access_token to authenticate or share sessions
  // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
  // ws.send('something');
  console.log("WS-Connect");
  observer.register(ws);
  ws.on('close', () => {
    console.log("close");
    observer.unregister(ws);
  });
  // ws.on('data', msg:any => console.log(msg));
  ws.on('message', (payload) => {
    let msg = Message.fromData(payload);
    // console.log("onMessage")
    dispatch.run(ws, msg)
  });
});

httpServer.on('request', app);
httpServer.listen(applicationPort);
