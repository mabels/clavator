import GpgVersion from './gpg-version';
// import Gpg from './gpg';
// import { ResultContainer, ResultObservable, ResultObserver, ResultQueue } from './result';
// import * as rx from 'rxjs';
import * as rxme from 'rxme';
import { ResultExec, ResultQueue } from './result';
import { RxMe } from 'rxme';

interface StringFunc {
  (): string;
}
export type Mixed = string | StringFunc;

class GpgCmd {
  private readonly cmd: string[];
  public version: rxme.RxMe;
  public readonly resultQueue: ResultQueue;

  public static create(rq: ResultQueue, cmd: string[]): rxme.Observable {
    return rxme.Observable.create(obs => {
      const gpgCmd = new GpgCmd(rq, cmd);
      const rxmeGpgCmd = rxme.Msg.Type(gpgCmd);
      gpgCmd.resolveVersion().match((_, res) => {
        obs.next(rxmeGpgCmd);
        // ResultContainer.builder(rq).setData(gpgCmd).doComplete(obs);
        return true;
      }).passTo(obs);
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

  public resolveVersion(): rxme.Observable {
    return rxme.Observable.create(obs => {
      this.run('getVersion', '', ['--version'], '').match((_, res) => {
        this.version = res;
        const lines = res.stdOut.split(/[\n\r]+/);
        // console.log(lines);
        if (lines[0]) {
          res.data = new GpgVersion(lines[0]);
        } else {
          res.nodeError = new Error('--version out not parsable');
        }
        res.doComplete(obs);
        return true;
      }).passTo(obs);
    });
  }

  public run(initiator: string, homeDir: string, attributes: Mixed[], stdIn: string): rxme.Observable {
    if (homeDir) {
      attributes.splice(0, 0, homeDir);
      attributes.splice(0, 0, '--homedir');
    }
    const rc = new ResultExec();
    // ResultContainer.builder<T>(this.resultQueue);
    rc.setStdIn(stdIn);
    // console.log('GpgCmd:run', this.cmd, homeDir, attributes);
    return rc.run(initiator, homeDir, this.cmd[0], this.cmd.slice(1), attributes);
  }
}

export class GpgCmds {
  public readonly gpg: GpgCmd;
  public readonly agent: GpgCmd;
  public readonly order: number;
  public readonly mock: boolean;

  public static create(rq: ResultQueue, gpgcmdStr: string[], agentStr: string[], order: number, mock = false):
    rxme.Observable {
    return rxme.Observable.create(obs => {
      GpgCmd.create(rq, gpgcmdStr).match((_, gpgres) => {
        // console.log('GpgRes.create-1:', gpgres.data, gpgres.progress);
        GpgCmd.create(rq, agentStr).match((__, agentres) => {
          // console.log('AgentRes.create-1:', agentres.data, agentres.progress);
          obs.next(rxme.Msg.Type(new GpgCmds(gpgres, agentres, order, mock)));
          return false;
        }).passTo(obs);
        return false;
      }).passTo(obs);
    });
  }

  private constructor(gpgcmd: GpgCmd, agent: GpgCmd, order: number, mock: boolean) {
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
