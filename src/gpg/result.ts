import { spawn } from 'child_process';
import * as stream from 'stream';
import * as uuid from 'uuid';
import * as fsPromise from 'fs-extra';
import * as path from 'path';

import { Gpg } from './gpg';

interface StringFunc {
  (): string;
}

export type Mixed = string | StringFunc;

class ResultQueue {
  public cmd: string;
  public attributes: Mixed[];
  public cb: (res: Result) => void;
}

interface ExecTransaction {
  transaction: string;
  dumpFname?: string;
  data?: any;
}

export class Result {
  public stdOut: string;
  public stdErr: string;
  public stdIn: string;
  public execTransaction: ExecTransaction;
  public env: { [id: string]: string } = {};
  public exitCode: number;
  public runQueue: ResultQueue[] = [];
  public readonly gpg: Gpg;

  constructor(gpg: Gpg) {
    (<any>Object).assign(this.env, process.env);
    this.gpg = gpg;
    this.stdIn = '';
    this.stdOut = '';
    this.stdErr = '';
  }

  public setStdIn(stdIn: string): Result {
    this.stdIn = stdIn;
    return this;
  }

  public addEnv(key: string, value: string): Result {
    this.env[key] = value;
    return this;
  }

  public run(
    cmd: string,
    cmdArgs: Mixed[],
    attributes: Mixed[],
    cb: (res: Result) => void
  ): void {
    let args = cmdArgs.concat(attributes);
    this.runQueue.push({ cmd: cmd, attributes: args, cb: cb });
    if (this.runQueue.length == 1) {
      this._run(cmd, args, cb);
    }
  }

  public processQueue(): void {
    this.runQueue.shift();
    if (this.runQueue.length > 0) {
      let head = this.runQueue[0];
      this._run(head.cmd, head.attributes, head.cb);
    }
  }

  private _run(
    cmd: string,
    attributes: Mixed[],
    cb: (res: Result) => void
  ): void {
    // console.log("run=["+cmd+"]", attributes);
    let fds: (() => string)[] = [];
    let freeFd = 3;
    let attrs = attributes.map(i => {
      if (typeof i == 'function') {
        fds.push(i);
        return '' + freeFd++;
      }
      return i;
    });
    let writables: string[] = fds.map(func => {
      return 'pipe';
    });

    let stdio: any[] = ['pipe', 'pipe', 'pipe'];
    stdio = stdio.concat(writables);
    // console.log('STDIO:', stdio);
    this.execTransaction = { transaction: uuid.v4() };
    console.log('run=', cmd, attrs);
    const c = spawn(cmd, attrs, {
      env: Object.assign(
        {
          NODEEXECTRANSACTION: this.execTransaction.transaction
        },
        this.env
      ),
      stdio: stdio
    });
    c.on('error', (e: Event) => {
      console.error(`SPAWN ERROR:`, cmd, attrs, e);
      cb(this);
      this.processQueue();
    });
    if (this.stdIn && this.stdIn.length > 0) {
      let s = new stream.Readable();
      s.push(this.stdIn);
      s.push(null);
      s.pipe(c.stdin);
    }

    // console.log(">>>>>>", stdio.length);
    for (let j = 3; j < stdio.length; ++j) {
      (i => {
        let s_closed = false;
        c.stdio[i].on('error', (e: any) => {
          if (!s_closed) {
            console.error('stdio->' + i + '->error', e);
          }
        });
        c.stdio[i].on('end', () => {
          // console.log('stdio->'+i+"->end");
        });
        let s = new stream.Readable();
        // console.log(">>>>>>", stdio.length, i, 1, fds[i-3]());
        s.push(fds[i - 3]());
        // console.log(">>>>>>", stdio.length, i, 2);
        s.push(null);
        // console.log(">>>>>>", stdio.length, i, 3);
        s.pipe(
          c.stdio[i] as stream.Writable,
          { end: true }
        );
        // console.log(">>>>>>", stdio.length, i, 4);
        s.on('end', () => {
          s_closed = true;
          // console.log("s.end:", i);
        });
      })(j);
    }

    c.stdout.on('data', (data: string) => {
      this.stdOut += data;
    });
    c.stderr.on('data', (data: string) => {
      this.stdErr += data;
    });
    c.on('close', (code: number) => {
      if (code) {
        console.error(`SPAWN CLOSE:`, cmd, attrs, code);
      }
      this.exitCode = code;
      this.readExectransactionDump(cb);
      this.processQueue();
    });
  }

  private readExectransactionDump(cb: (res: Result) => void): void {
    this.execTransaction.dumpFname = path.join(
      this.gpg.homeDir || '',
      `${this.execTransaction.transaction}.dump`
    );
    // console.log(`readExectransactionDump:${this.execTransaction.dumpFname}`);
    fsPromise
      .readFile(this.execTransaction.dumpFname)
      .then(data => {
        try {
          this.execTransaction.data = JSON.parse(data.toString());
        } catch (_) {
          /* */
        }
        fsPromise
          .unlink(this.execTransaction.dumpFname)
          .then(_ => {
            cb(this);
          })
          .catch(err => {
            cb(this);
          });
      })
      .catch(err => {
        cb(this);
      });
  }
}
