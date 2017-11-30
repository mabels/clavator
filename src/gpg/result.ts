import { spawn } from 'child_process';
import * as fs from 'fs';
import * as stream from 'stream';
import * as uuid from 'node-uuid';
// import { Gpg } from './gpg';
// import * as fsPromise from 'fs-extra';
import * as path from 'path';
import { Observable, Observer } from 'rxjs';
// import { intercept } from 'mobx/lib/api/intercept';
import * as rx from 'rxjs';
import * as simqle from 'simqle';

interface StringFunc {
  (): string;
}

interface AttrAndWritablesAndFds {
  attrs: string[];
  writables: string[];
  fds: (() => string)[];
}

export type Mixed = string | StringFunc;

interface ExecTransaction {
  transaction: string;
  dumpFname?: string;
  data?: any;
}

export class ResultQueue {
  public readonly logger: rx.Subject<simqle.LogMsg>;
  public readonly runQueue: simqle.Queue<ResultContainer<any>>;

  public static create(): ResultQueue {
    return new ResultQueue();
  }

  private constructor() {
    this.logger = new rx.Subject<simqle.LogMsg>();
    this.logger.subscribe((l: simqle.LogMsg) => {
      const level = (console as any)[l.level];
      level.apply(level, l.parts);
    });
    this.runQueue = simqle.start<ResultContainer<any>>(this.logger, { taskTimer: 250 });
    this.action = this.action.bind(this);
    this.runQueue.addWorker(this.action);
  }

  public stop(): rx.Observable<void> {
    return this.runQueue.stop();
  }

  private createAttrsAndWritablesAndFds(mattr: Mixed[]): AttrAndWritablesAndFds {
    const fds: (() => string)[] = [];
    let freeFd = 3;
    let attrs = mattr.map((i) => {
      if (typeof (i) == 'function') {
        fds.push(i);
        return '' + freeFd++;
      }
      return i;
    });
    const writables: string[] = fds.map((func) => 'pipe');
    return { attrs: attrs, writables: writables, fds: fds };
  }

  public action(input: rx.Observable<ResultContainer<any>>, output: rx.Subject<ResultContainer<any>>): void {
    input.subscribe(rc => {
      if (rc.doProgress(output)) { return; }
      if (rc.doError(output)) { return; }
      // console.log('Worker.action:');
      const aaw = this.createAttrsAndWritablesAndFds(rc.exec.cmdArgs.concat(rc.exec.attributes));
      const stdio: string[] = ['pipe', 'pipe', 'pipe'].concat(aaw.writables);
      rc.exec.execTransaction = { transaction: uuid.v4() };
      rc.log(output, [
        `Pre-Spawn:[${rc.initiator}:${rc.exec.execTransaction.transaction}]`,
        `[${rc.exec.cmd} ${aaw.attrs.join(' ')}]`
      ].join(''));
      const c = spawn(rc.exec.cmd, aaw.attrs, {
        env: rc.exec.addEnv('NODEEXECTRANSACTION', rc.exec.execTransaction.transaction).env,
        stdio: stdio
      });
      c.on('error', (e: Error) => {
        rc.log(output, `Error:[${rc.exec.execTransaction.transaction}][${rc.exec.cmd} ${aaw.attrs.join(' ')}][${e}]`);
        rc.nodeError = e;
        rc.doComplete(output);
      });

      if (rc.exec.stdIn && rc.exec.stdIn.length > 0) {
        let s = new stream.Readable();
        s.push(rc.exec.stdIn);
        s.push(null);
        s.pipe(c.stdin);
      }

      // console.log(">>>>>>", stdio.length);
      for (let j = 3; j < stdio.length; ++j) {
        ((i) => {
          let s_closed = false;
          c.stdio[i].on('error', (e: any) => {
            if (!s_closed) {
              console.error('stdio->' + i + '->error', e);
            }
          });
          c.stdio[i].on('end', (e: any) => { /*console.log("stdio->"+i+"->end", e) */ });
          let s = new stream.Readable();
          // console.log(">>>>>>", stdio.length, 1, fds[i-3]());
          s.push(aaw.fds[i - 3]());
          // console.log(">>>>>>", stdio.length, 2);
          s.push(null);
          // console.log(">>>>>>", stdio.length, 3);
          s.pipe(c.stdio[i] as stream.Writable, { end: true });
          // console.log(">>>>>>", stdio.length, 4);
          s.on('end', () => {
            s_closed = true;
            // console.log("s.end:", i);
          });
        })(j);
      }

      c.stdout.on('data', (data: string) => { rc.exec.stdOut += data; });
      c.stderr.on('data', (data: string) => { rc.exec.stdErr += data; });
      c.on('close', (code: number) => {
        rc.exec.exitCode = code;
        this.readExectransactionDump(rc).subscribe(_ => {
          // console.log('logExec: ok');
          rc.logExec(output, rc.exec);
          output.next(rc);
          output.complete();
        }, _ => {
          // console.log('logExec: ignore');
          rc.logExec(output, rc.exec);
          output.next(rc);
          output.complete();
        });
      });
    });
  }

  private readExectransactionDump(rc: ResultContainer<any>): ResultObservable<any> {
    return rx.Observable.create((obs: ResultObserver<any>) => {
      rc.exec.execTransaction.dumpFname = path.join(rc.exec.baseDir || '',
        `${rc.exec.execTransaction.transaction}.dump`);
      fs.readFile(rc.exec.execTransaction.dumpFname, (err, data) => {
        if (err) {
          obs.error(err);
          return;
        }
        try {
          rc.exec.execTransaction.data = JSON.parse(data.toString());
        } catch (_) {
          /* */
        }
        fs.unlink(rc.exec.execTransaction.dumpFname, (uerr) => {
          if (uerr) {
            obs.error(uerr);
            return;
          } else {
            obs.next(rc);
            obs.complete();
          }
        });
      });
    });
  }
}

export class ResultTextProgress {
  public readonly text: string[];

  constructor(text: string[]) {
    this.text = text;
  }
}

export type ResultProgress = ResultTextProgress | ResultExec;

export class ResultExec {
  public stdOut: string;
  public stdErr: string;
  public stdIn: string;
  public execTransaction: ExecTransaction;
  public cmd: string;
  public cmdArgs: Mixed[];
  public attributes: Mixed[];
  public baseDir: string;
  public env: { [id: string]: string; };
  public exitCode: number;

  constructor() {
    this.env = (<any>Object).assign({}, process.env);
    this.stdIn = '';
    this.stdOut = '';
    this.stdErr = '';
  }

  public setStdIn(stdIn: string): ResultExec {
    this.stdIn = stdIn;
    return this;
  }

  public addEnv(key: string, value: string): ResultExec {
    this.env[key] = value;
    return this;
  }
}

export class ResultContainer<T> {
  // public readonly next: ResultContainer<any>[];
  public initiator: string;
  public parent: ResultContainer<any>;
  public exec: ResultExec;
  public data: T;
  // public exitCode: number;
  public nodeError: NodeJS.ErrnoException;
  public progress: ResultProgress;
  public readonly progresses: ResultContainer<ResultProgress>[];
  public readonly resultQueue: ResultQueue;

  public static builder<A>(rq: ResultQueue): ResultContainer<A> {
    return new ResultContainer<A>(rq);
  }

  private constructor(rq: ResultQueue) {
    this.exec = new ResultExec();
    this.resultQueue = rq;
    this.progresses = [];
  }

  public asMsg(): string[] {
    const ret: string[] = [JSON.stringify(this)];
    return ret;
  }

  private each(obss: ResultObserver<any>|ResultObserver<any>[], fn: (obs: ResultObserver<any>) => void): void {
    if (!obss) {
      return;
    }
    let my: ResultObserver<any>[];
    if (obss instanceof Array) {
      my = obss;
    } else {
      my = [obss];
    }
    my.forEach(fn);
  }

  public doError(obss: ResultObserver<any>|ResultObserver<any>[] = null): boolean {
    const err = this.isError();
    if (err) {
      this.each(obss, obs => {
        obs.next(this);
        obs.complete();
      });
    }
    return err;
  }

  public addTextProgress(text: string[]): ResultContainer<ResultProgress> {
    const r = this.clone<ResultProgress>();
    r.progress = new ResultTextProgress(text);
    this.progresses.push(r);
    return r;
  }

  public addExecProgress(re: ResultExec): ResultContainer<ResultProgress> {
    const r = this.clone<ResultProgress>();
    r.progress = re;
    this.progresses.push(r);
    return r;
  }

  public logExec(obs: ResultObserver<any>, re: ResultExec): ResultContainer<T> {
    obs.next(this.addExecProgress(re));
    return this;
  }

  public log(obs: ResultObserver<any>, ...text: any[]): ResultContainer<T> {
    obs.next(this.addTextProgress(text));
    return this;
  }

  public isProgress(): boolean {
    return !!this.progress;
  }

  public doProgress(obss: ResultObserver<any>|ResultObserver<any>[] = null): boolean {
    const isp = this.isProgress();
    if (isp) {
      this.each(obss, obs => {
        obs.next(this);
      });
    }
    return isp;
  }

  public doComplete(obss: ResultObserver<any>|ResultObserver<any>[]): void {
    this.each(obss, obs => {
      obs.next(this);
      obs.complete();
    });
  }

  // public attachNext(oth: ResultContainer<any>): ResultContainer<T> {
  //   // this.next.push(oth);
  //   oth.parent = this;
  //   return this;
  // }

  public clone<A = T>(data: A = undefined): ResultContainer<A> {
    const oth = new ResultContainer<A>(this.resultQueue);
    // this.attachNext(oth);
    oth.parent = this;
    oth.data = data;
    oth.exec = this.exec;
    // oth.exitCode = this.exitCode;
    oth.nodeError = this.nodeError;
    // oth.runQueue = this.runQueue;
    return oth;
  }

  public setData(data: T): ResultContainer<T> {
    this.data = data;
    return this;
  }

  public setNodeError(err: NodeJS.ErrnoException): ResultContainer<T> {
    this.nodeError = err;
    return this;
  }

  public isError(): boolean {
    return !this.isProgress() && (!!this.exec.exitCode || !!this.nodeError); // || !!this.next.find(i => i.isError());
  }

  public isOk(): boolean {
    return !this.isProgress() && !this.isError();
  }

  public run(initiator: string, baseDir: string, cmd: string, cmdArgs: Mixed[], attributes: Mixed[]):
    ResultObservable<T> {
    this.initiator = initiator;
    this.exec.baseDir = baseDir;
    this.exec.cmd = cmd;
    this.exec.cmdArgs = cmdArgs;
    this.exec.attributes = attributes;
    const input = rx.Observable.create((iobs: ResultObserver<T>) => {
      iobs.next(this);
      iobs.complete();
    });
    const data: any = { next: [], error: [], complete: [] };
    const obs: ResultObserver<T>[] = [];
    const ret = rx.Observable.create((ob: ResultObserver<T>) => {
      data.next.forEach((d: any) => ob.next(d));
      data.error.forEach((e: any) => ob.error(e));
      data.complete.forEach((c: any) => ob.complete());
      obs.push(ob);
    });
    const output = new rx.Subject<ResultContainer<T>>();
    output.subscribe({
      next: (n) => {
        data.next.push(n);
        obs.forEach(o => o.next(n));
      },
      error: (e) => {
        data.next.push(e);
        obs.forEach(o => o.error(e));
      },
      complete: () => {
        data.complete.push('complete');
        obs.forEach(o => o.complete());
      }
    });
    this.resultQueue.runQueue.push(input, output);
    return ret;
  }

}

export type Result = ResultContainer<void>;
export type ResultObservable<T = void> = Observable<ResultContainer<T>>;
export type ResultObserver<T = void> = Observer<ResultContainer<T>>;
export default Result;
