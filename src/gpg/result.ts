import { spawn } from 'child_process';
import * as fs from 'fs';
import * as stream from 'stream';
import * as uuid from 'node-uuid';
// import { Gpg } from './gpg';
// import * as fsPromise from 'fs-extra';
import * as path from 'path';
// import { Observable, Observer } from 'rxjs';
// import { intercept } from 'mobx/lib/api/intercept';
import * as rxme from 'rxme';
import * as simqle from 'simqle';
import { MatcherCallback } from 'rxme';
// import { LogMsg } from 'simqle';

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

// export type ResultQueueObservable = rx.Observable<ResultQueue | simqle.LogMsg>;

export class ResultQueue {
  // public readonly logger: rx.Subject<simqle.LogMsg>;
  public readonly runQueue: simqle.Queue;

  public static match(cb: rxme.MatcherCallback<ResultQueue>): MatcherCallback {
    return rxme.Matcher.Type<ResultQueue>(ResultQueue, cb);
  }
  public static create(): rxme.Observable {
    return rxme.Observable.create(obs => {
      simqle.start({ taskTimer: 250 }).match(simqle.MatchQ(res => {
        obs.next(new rxme.RxMe(new ResultQueue(res)));
        return true;
      })).passTo(obs);
    });
  }

  private constructor(runQueue: simqle.Queue) {
    this.action = this.action.bind(this);
    this.runQueue = runQueue;

    // this.logger = new rx.Subject<simqle.LogMsg>();
    // this.logger.subscribe((l: simqle.LogMsg) => {
    //   const level = (console as any)[l.level];
    //   level.apply(level, l.parts);
    // });
  }

  public stop(): rxme.Observable {
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

  public action(input: rxme.Observable, output: rxme.Subject): void {
    input.match(ResultExec.match(rc => {
      // console.log('Worker.action:');
      const aaw = this.createAttrsAndWritablesAndFds(rc.cmdArgs.concat(rc.attributes));
      const stdio: string[] = ['pipe', 'pipe', 'pipe'].concat(aaw.writables);
      rc.execTransaction = { transaction: uuid.v4() };
      output.next(rxme.LogInfo(
        `Pre-Spawn:[${rc.initiator}:${rc.execTransaction.transaction}]`,
        `[${rc.cmd} ${aaw.attrs.join(' ')}]`));
      const c = spawn(rc.cmd, aaw.attrs, {
        env: rc.addEnv('NODEEXECTRANSACTION', rc.execTransaction.transaction).env,
        stdio: stdio
      });
      c.on('error', (e: Error) => {
        output.next(rxme.LogInfo(
          `Error:[${rc.execTransaction.transaction}][${rc.cmd} ${aaw.attrs.join(' ')}][${e}]`));
        rc.nodeError = e;
        rc.doComplete(output);
      });

      if (rc.stdIn && rc.stdIn.length > 0) {
        let s = new stream.Readable();
        s.push(rc.stdIn);
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

      c.stdout.on('data', (data: string) => { rc.stdOut += data; });
      c.stderr.on('data', (data: string) => { rc.stdErr += data; });
      c.on('close', (code: number) => {
        rc.exitCode = code;
        this.readExectransactionDump(rc).match((__, rexec) => {
          // console.log('logExec: ok');
          output.next(rxme.LogInfo(rc.toString()));
          output.next(new rxme.RxMe(rc));
          output.complete();
          return true;
        }).passTo(output);
      });
      return true;
    })).passTo(output);
  }

  private readExectransactionDump(rc: ResultExec): rxme.Observable {
    return rxme.Observable.create(obs => {
      rc.execTransaction.dumpFname = path.join(rc.baseDir || '',
        `${rc.execTransaction.transaction}.dump`);
      fs.readFile(rc.execTransaction.dumpFname, (err, data) => {
        if (err) {
          obs.error(err);
          return;
        }
        try {
          rc.execTransaction.data = JSON.parse(data.toString());
        } catch (_) {
          /* */
        }
        fs.unlink(rc.execTransaction.dumpFname, (uerr) => {
          if (uerr) {
            obs.error(uerr);
            return;
          } else {
            obs.next(rxme.Msg.Type(rc));
            obs.complete();
          }
        });
      });
    });
  }
}

// export class ResultTextProgress {
//   public readonly text: string[];

//   constructor(text: string[]) {
//     this.text = text;
//   }
// }

// export type ResultProgress = ResultTextProgress | ResultExec;

export class ResultExec {
  public initiator: string;
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

  public static match(cb: rxme.MatcherCallback<ResultExec>): rxme.MatcherCallback {
    return rxme.Matcher.Type<ResultExec>(ResultExec, cb);
  }

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

  public run(initiator: string, baseDir: string, cmd: string, cmdArgs: Mixed[], attributes: Mixed[]):
    rxme.Observable {
    this.initiator = initiator;
    this.baseDir = baseDir;
    this.cmd = cmd;
    this.cmdArgs = cmdArgs;
    this.attributes = attributes;
    const input = rxme.Observable.create(iobs => {
      iobs.next(rxme.Msg.Type(this));
      iobs.complete();
    });
    const data: any = { next: [], error: [], complete: [] };
    const obs: rxme.Observer[] = [];
    const ret = rxme.Observable.create(ob => {
      // data.next.forEach((d: any) => ob.next(d));
      // data.error.forEach((e: any) => ob.error(e));
      // data.complete.forEach((c: any) => ob.complete());
      obs.push(ob);
    });
    const output = new rxme.Subject();
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
    this.runQueue.push(input, output);
    return ret;
  }
}

// export class ResultContainer<T> {
//   // public readonly next: ResultContainer<any>[];
//   public initiator: string;
//   public parent: ResultContainer<any>;
//   public exec: ResultExec;
//   public data: T;
//   // public exitCode: number;
//   public nodeError: NodeJS.ErrnoException;
//   public progress: ResultProgress;
//   public readonly progresses: ResultContainer<ResultProgress>[];
//   public readonly resultQueue: ResultQueue;

//   public static builder<A>(rq: ResultQueue): ResultContainer<A> {
//     return new ResultContainer<A>(rq);
//   }

//   private constructor(rq: ResultQueue) {
//     this.exec = new ResultExec();
//     this.resultQueue = rq;
//     this.progresses = [];
//   }

//   public asMsg(): string[] {
//     const ret: string[] = [JSON.stringify(this)];
//     return ret;
//   }

//   private each(obss: ResultObserver<any> | ResultObserver<any>[], fn: (obs: ResultObserver<any>) => void): void {
//     if (!obss) {
//       return;
//     }
//     let my: ResultObserver<any>[];
//     if (obss instanceof Array) {
//       my = obss;
//     } else {
//       my = [obss];
//     }
//     my.forEach(fn);
//   }

//   public doError(obss: ResultObserver<any> | ResultObserver<any>[] = null): boolean {
//     const err = this.isError();
//     if (err) {
//       this.each(obss, obs => {
//         obs.next(this);
//         obs.complete();
//       });
//     }
//     return err;
//   }

//   public addTextProgress(text: string[]): ResultContainer<ResultProgress> {
//     const r = this.clone<ResultProgress>();
//     r.progress = new ResultTextProgress(text);
//     this.progresses.push(r);
//     return r;
//   }

//   public addExecProgress(re: ResultExec): ResultContainer<ResultProgress> {
//     const r = this.clone<ResultProgress>();
//     r.progress = re;
//     this.progresses.push(r);
//     return r;
//   }

//   public logExec(obs: ResultObserver<any>, re: ResultExec): ResultContainer<T> {
//     obs.next(this.addExecProgress(re));
//     return this;
//   }

//   public log(obs: ResultObserver<any>, ...text: any[]): ResultContainer<T> {
//     obs.next(this.addTextProgress(text));
//     return this;
//   }

//   public isProgress(): boolean {
//     return !!this.progress;
//   }

//   public doProgress(obss: ResultObserver<any> | ResultObserver<any>[] = null): boolean {
//     const isp = this.isProgress();
//     if (isp) {
//       this.each(obss, obs => {
//         obs.next(this);
//       });
//     }
//     return isp;
//   }

//   public doComplete(obss: ResultObserver<any> | ResultObserver<any>[] = null): void {
//     this.each(obss, obs => {
//       obs.next(this);
//       obs.complete();
//     });
//   }

//   // public attachNext(oth: ResultContainer<any>): ResultContainer<T> {
//   //   // this.next.push(oth);
//   //   oth.parent = this;
//   //   return this;
//   // }

//   public clone<A = T>(data: A = undefined): ResultContainer<A> {
//     const oth = new ResultContainer<A>(this.resultQueue);
//     // this.attachNext(oth);
//     oth.parent = this;
//     oth.data = data;
//     oth.exec = this.exec;
//     // oth.exitCode = this.exitCode;
//     oth.nodeError = this.nodeError;
//     // oth.runQueue = this.runQueue;
//     return oth;
//   }

//   public setData(data: T): ResultContainer<T> {
//     this.data = data;
//     return this;
//   }

//   public setNodeError(err: NodeJS.ErrnoException): ResultContainer<T> {
//     this.nodeError = err;
//     return this;
//   }

//   public isError(): boolean {
//     return !this.isProgress() && (!!this.exec.exitCode || !!this.nodeError);
//     // || !!this.next.find(i => i.isError());
//   }

//   public isOk(): boolean {
//     return !this.isProgress() && !this.isError();
//   }

//   public run(initiator: string, baseDir: string, cmd: string, cmdArgs: Mixed[], attributes: Mixed[]):
//     ResultObservable<T> {
//     this.initiator = initiator;
//     this.exec.baseDir = baseDir;
//     this.exec.cmd = cmd;
//     this.exec.cmdArgs = cmdArgs;
//     this.exec.attributes = attributes;
//     const input = rx.Observable.create((iobs: ResultObserver<T>) => {
//       iobs.next(this);
//       iobs.complete();
//     });
//     const data: any = { next: [], error: [], complete: [] };
//     const obs: ResultObserver<T>[] = [];
//     const ret = rx.Observable.create((ob: ResultObserver<T>) => {
//       data.next.forEach((d: any) => ob.next(d));
//       data.error.forEach((e: any) => ob.error(e));
//       data.complete.forEach((c: any) => ob.complete());
//       obs.push(ob);
//     });
//     const output = new rx.Subject<ResultContainer<T>>();
//     output.subscribe({
//       next: (n) => {
//         data.next.push(n);
//         obs.forEach(o => o.next(n));
//       },
//       error: (e) => {
//         data.next.push(e);
//         obs.forEach(o => o.error(e));
//       },
//       complete: () => {
//         data.complete.push('complete');
//         obs.forEach(o => o.complete());
//       }
//     });
//     this.resultQueue.runQueue.push(input, output);
//     return ret;
//   }

// }

// export type Result = ResultContainer<void>;
// export type ResultQueueObservable<T = void> = rx.Observable<T| simqle.LogMsg>;
// export type ResultObservable<T = void> = rx.Observable<ResultContainer<T>| simqle.LogMsg>;
// export type ResultObserver<T = void> = rx.Observer<ResultContainer<T>| simqle.LogMsg>;
// export default Result;
