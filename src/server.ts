
import * as fs from 'fs'
import * as http from 'http'
import * as https from 'https'

let privateKey : string = null;
let certificate : string = null;
try {
  privateKey  = fs.readFileSync('/etc/letsencrypt/live/clavator.com/privkey1.pem', 'utf8');
  certificate = fs.readFileSync('/etc/letsencrypt/live/clavator.com/fullchain.pem', 'utf8');
} catch(e) {
}
const credentials = {key: privateKey, cert: certificate};

import { join } from 'path';
import * as expressTs from 'express';
const express: typeof expressTs = expressTs;
import * as expressWsTs from 'express-ws';
const expressWs: typeof expressWsTs = expressWsTs;



import * as Observer from './observer';
import * as Dispatch from './dispatch';
import * as Gpg from './gpg/gpg';

import * as Message from './message';

const app = express();
expressWs(app);

app.use(express.static(join(process.cwd(), 'dist')));

let gpg = new Gpg.Gpg();

// gpg.createSubkey("DDC4941118503075", (res:Gpg.Result) => {
//
// });

let observer = Observer.start(gpg);
let dispatch = Dispatch.start(gpg);

app.get('/', (req: expressTs.Request, res: expressTs.Response) => res.redirect('/index.html'));
app.ws('/', (ws, req) => {
  console.log("WS-Connect");
  observer.register(ws);
  ws.on('close', () => {
    console.log("close");
    observer.unregister(ws);
  });
  // ws.on('data', msg:any => console.log(msg));
  ws.on('message', payload => {
    let msg = Message.fromData(payload);
     console.log("onMessage")
    dispatch.run(ws, msg)
  });
});

let http_port = 8080;
let https_port = 8443;
if (process.getuid() == 0) {
  http_port = 80;
  https_port = 443;
}

if (privateKey) {
  var httpsServer = https.createServer(credentials, app);
  httpsServer.listen(https_port);
  console.log(`Listen on: SSL ${https_port}`)
} else {
  var httpServer = http.createServer(app);
  httpServer.listen(http_port);
  console.log(`Listen on: ${http_port}`)
}

