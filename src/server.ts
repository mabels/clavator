
import { join } from 'path';
import * as expressTs from 'express';
const express: typeof expressTs = expressTs;
import * as expressWsTs from 'express-ws';
const expressWs: typeof expressWsTs = expressWsTs;

import * as Observer from './observer';
import * as Gpg from './gpg/gpg';

const app = express();
expressWs(app);

app.use(express.static(join(process.cwd(), 'dist')));

let gpg = new Gpg.Gpg();

let observer = Observer.start(gpg);

app.get('/', (req: expressTs.Request, res: expressTs.Response) => res.redirect('/index.html'));
app.ws('/', (ws, req) => {
  console.log("WS-Connect");
  observer.register(ws);
  ws.on('close', () => {
    console.log("close");
    observer.unregister(ws);
  });
  ws.on('message', msg => console.log(msg));
});


app.listen(8888, () => {
  console.log('Listening on port 8888');
});
