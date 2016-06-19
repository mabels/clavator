import { join } from 'path';
import * as expressTs from 'express';
const express: typeof expressTs = expressTs;
import * as expressWsTs from 'express-ws';
const expressWs: typeof expressWsTs = expressWsTs;

const app = express();
expressWs(app);

app.use(express.static(join(process.cwd(), 'dist')));
app.get('/', (req: expressTs.Request, res: expressTs.Response) => res.redirect('/index.html'));
app.ws('/', (ws, req) => {
  ws.on('message', msg => console.log(msg));
  ws.send('yada');
});


app.listen(8888, () => {
  console.log('Listening on port 8888');
});
