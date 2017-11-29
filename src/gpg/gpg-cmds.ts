import GpgVersion from './gpg-version';
// import Gpg from './gpg';
import { ResultContainer, ResultObservable, ResultObserver, ResultQueue } from './result';
import * as rx from 'rxjs';

interface StringFunc {
  (): string;
}
export type Mixed = string | StringFunc;

class GpgCmd {
  private readonly cmd: string[];
  public version: ResultContainer<GpgVersion>;
  private readonly resultQueue: ResultQueue;

  public static create(rq: ResultQueue, cmd: string[]): ResultObservable<GpgCmd> {
    return rx.Observable.create((obs: ResultObserver<GpgCmd>) => {
      const gpgCmd = new GpgCmd(rq, cmd);
      gpgCmd.resolveVersion().subscribe(res => {
        if (res.doProgress(obs)) { return; }
        if (res.doError(obs)) { return; }
        ResultContainer.builder(rq).setData(gpgCmd).doComplete(obs);
      });
    });
  }

  private constructor(rq: ResultQueue, cmd: string[]) {
    this.resultQueue = rq;
    this.cmd = cmd;
  }

  public info(): string {
    if (this.version.isError()) {
      return 'unknown';
    } else {
      return `[${this.cmd.join(' ')}][${this.version.data.asString()}]`;
    }
  }

  // public clone(): GpgCmd {
  //   return new GpgCmd(this.cmd.map(i => i), this.gpg);
  // }

  public resolveVersion(): ResultObservable<GpgVersion> {
    return rx.Observable.create((obs: ResultObserver<GpgVersion>) => {
      this.run<GpgVersion>('getVersion', '', ['--version'], '').subscribe(res => {
        if (res.doProgress(obs)) { return; }
        if (res.doError(obs)) { return; }
        this.version = res;
        const lines = res.exec.stdOut.split(/[\n\r]+/);
        // console.log(lines);
        if (lines[0]) {
          res.data = new GpgVersion(lines[0]);
        } else {
          res.nodeError = new Error('--version out not parsable');
        }
        res.doComplete(obs);
      });
    });
  }

  public run<T = void>(initiator: string, homeDir: string, attributes: Mixed[], stdIn: string): ResultObservable<T> {
    if (homeDir) {
      attributes.splice(0, 0, homeDir);
      attributes.splice(0, 0, '--homedir');
    }
    const rc = ResultContainer.builder<T>(this.resultQueue);
    rc.exec.setStdIn(stdIn);
    // console.log('GpgCmd:run', this.cmd, homeDir, attributes);
    return rc.run(initiator, homeDir, this.cmd[0], this.cmd.slice(1), attributes);
  }
}

export class GpgCmds {
  public readonly gpg: ResultContainer<GpgCmd>;
  public readonly agent: ResultContainer<GpgCmd>;
  public readonly order: number;
  public readonly mock: boolean;

  public static create(rq: ResultQueue, gpgcmdStr: string[], agentStr: string[], order: number, mock = false):
    ResultObservable<GpgCmds> {
    return rx.Observable.create((obs: ResultObserver<GpgCmds>) => {
      GpgCmd.create(rq, gpgcmdStr).subscribe(gpgres => {
        // console.log('GpgRes.create-0:', gpgres.data, gpgres.progress);
        if (gpgres.doProgress(obs)) { return; }
        if (gpgres.doError(obs)) { return; }
        // console.log('GpgRes.create-1:', gpgres.data, gpgres.progress);
        GpgCmd.create(rq, agentStr).subscribe(agentres => {
          if (agentres.doProgress(obs)) { return; }
          if (agentres.doError(obs)) { return; }
          // console.log('AgentRes.create-1:', agentres.data, agentres.progress);
          const rc = ResultContainer.builder<GpgCmds>(rq);
          rc.data = new GpgCmds(gpgres, agentres, order, mock);
          rc.doComplete(obs);
        });
      });
    });
  }

  private constructor(gpgcmd: ResultContainer<GpgCmd>, agent: ResultContainer<GpgCmd>,
    order: number, mock: boolean) {
    this.gpg = gpgcmd;
    this.agent = agent;
    this.order = order;
    this.mock = mock;
  }

  // public clone(): GpgCmds {
  //   return new GpgCmds(this.gpg.clone(), this.agent.clone());
  // }
}

export default GpgCmds;
