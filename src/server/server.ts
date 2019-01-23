import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';

import * as express from 'express';
import * as ws from 'ws';
import * as yargs from 'yargs';

import { Observer } from './observer';
import { Dispatch } from './dispatch';
import { Gpg } from '../gpg/gpg';

import { Message } from '../model';

interface Config {
  readonly domain: string;
  readonly redirectPort: number;
  readonly applicationPort: number;
  readonly useMock: boolean;
  readonly credentials: {
    readonly privateKey?: string;
    readonly certificate?: string;
  };
}

async function starter(cfg: Config): Promise<void> {
  const redirectHttp = express();
  redirectHttp.get('/*', (req, res, next) =>
    res.redirect(`https://${cfg.domain}/`)
  );
  redirectHttp.listen(cfg.redirectPort);
  console.log(`Started redirectPort on ${cfg.redirectPort}`);

  let httpServer: https.Server | http.Server;
  if (cfg.credentials.privateKey) {
    httpServer = https.createServer({
      key: cfg.credentials.privateKey,
      cert: cfg.credentials.certificate
    });
    console.log(`Listen on: https ${cfg.applicationPort}`);
  } else {
    httpServer = http.createServer();
    console.log(`Listen on: http ${cfg.applicationPort}`);
  }

  const app = express();
  app.use(express.static(path.join(process.cwd(), 'dist')));

  let gpg = await Gpg.create();
  if (cfg.useMock) {
    const cmd: string[] = gpg.mockCmd;
    const cmdAgent = cmd.concat(['connect-agent']);
    gpg = gpg.setGpgCmd(cmd);
    gpg = gpg.setGpgAgentCmd(cmdAgent);
  }
  const gi = await gpg.info();
  console.log('Created Gpg:', gi);

  const observer = Observer.start(gpg);
  const dispatch = Dispatch.start(gpg);

  app.get('/', (req: express.Request, res: express.Response) =>
    res.redirect('/index.html')
  );

  app.get('/privkey.pem', (req: express.Request, res: express.Response) => {
    if (cfg.credentials.privateKey) {
      res.send(cfg.credentials.privateKey);
    } else {
      res.sendStatus(404);
    }
  });
  app.get('/fullchain.pem', (req: express.Request, res: express.Response) => {
    if (cfg.credentials.certificate) {
      res.send(cfg.credentials.certificate);
    } else {
      res.sendStatus(404);
    }
  });

  let wss = new ws.Server({ server: httpServer });
  wss.on('connection', sock => {
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
    sock.on('message', payload => {
      let msg = Message.fromData(payload.toString());
      // console.log('onMessage')
      dispatch.run(observer, sock, msg);
    });
  });

  httpServer.on('request', app);
  httpServer.listen(cfg.applicationPort);
}

function cli(args: string[]): Config {
  let redirectPort = process.env.HTTPPORT || 8080;
  let applicationPort = process.env.PORT || 8443;
  if (process.getuid() == 0) {
    redirectPort = 80;
    applicationPort = process.env.PORT || 443;
  }

  const domain = process.env.DOMAIN || 'clavator.com';

  let y = yargs.usage('$0 <cmd> [args]');
  y = y.options({
    privateKeyFile: {
      describe: 'path to privateKey PEM file',
      type: 'string',
      default:
        process.env.PRIVATEKEYFILE ||
        `/etc/letsencrypt/live/${domain}/privkey.pem`
    },
    certificateFile: {
      describe: 'path to certificateFile PEM file',
      type: 'string',
      default:
        process.env.PRIVATEKEYFILE ||
        `/etc/letsencrypt/live/${domain}/fullchain.pem`
    },
    useMock: {
      describe: 'useMock',
      type: 'boolean',
      default: false
    },
    domain: {
      describe: 'domain name for redirect and keyfiles',
      type: 'string',
      default: domain
    },
    redirectPort: {
      describe: 'http redirect port',
      type: 'number',
      default: redirectPort
    },
    applicationPort: {
      describe: 'application http port',
      type: 'number',
      default: applicationPort
    }
  });
  y = y.help().showHelpOnFail(true);
  const x = y.parse(
    args.slice(2),
    (err: any, argv: yargs.Arguments, output: any) => {
      // state.parsed(argv);
    }
  );

  let privateKey: string = undefined;
  let certificate: string = undefined;
  try {
    privateKey = fs.readFileSync(x.privateKeyFile, 'utf8').toString();
    certificate = fs.readFileSync(x.certificateFile, 'utf8').toString();
  } catch (e) {
    /* */
  }
  // console.log(x);

  return {
    domain: x.domain,
    redirectPort: x.redirectPort,
    applicationPort: x.applicationPort,
    useMock: x.useMock,
    credentials: {
      privateKey,
      certificate
    }
  };
}

starter(cli(process.argv));
