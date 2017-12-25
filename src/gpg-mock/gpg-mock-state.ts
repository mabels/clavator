import * as path from 'path';
import * as fs from 'fs';
import * as yargs from 'yargs';
import * as rxme from 'rxme';

export interface ParsedAction {
  (y: yargs.Arguments, state: GpgMockState): rxme.Observable; // returns true stopped
}

interface StdOut {
  fname: string;
  value: string;
}

export default class GpgMockState {
  public actions: ParsedAction[];
  public _exitCode: number;
  public stdOut: StdOut[];
  public _processed: boolean;

  public static create(): GpgMockState {
    const ret = new GpgMockState();
    return ret;
  }

  constructor() {
    this.actions = [];
    this._exitCode = 0;
    this.stdOut = [];
  }

  public processed(): void {
    this._processed = true;
  }

  public stdout(str: string): void {
    this.stdOut.push({ fname: '', value: str });
  }

  public writeJson(y: yargs.Arguments, fname: string, obj: any): void {
    fs.writeFileSync(path.join(y.homedir, fname), JSON.stringify(obj));
  }

  public stdoutMock(mockFname: string, str: string): void {
    this.stdOut.push({ fname: mockFname, value: str });
  }

  public exitCode(code: number): void {
    this._exitCode = code;
  }

  public onParsed(action: ParsedAction): void {
    this.actions.push(action);
  }

  private processAction(y: yargs.Arguments, obs: rxme.Observer, idx: number): void {
    if (idx >= this.actions.length) {
      obs.complete();
      return;
    }
    // console.log('processAction', idx, this.actions[idx]);
    this.actions[idx](y, this).match((_, res) => {
      // console.log('processAction', idx, res);
      if (res) {
        this._processed = true;
      } else {
        this.processAction(y, obs, idx + 1);
      }
      return true;
    });
  }

  private processParsed(y: yargs.Arguments): void {
    // console.log('processParsed');
    if (this._processed) {
      this.stdOut.forEach(i => console.log(i.value));
    }
    if (process.env['NODEEXECTRANSACTION'] && y.homedir && fs.existsSync(y.homedir)) {
      const dump = path.join(y.homedir || '', `${process.env['NODEEXECTRANSACTION']}.dump`);
      const readFds = (y.passphraseFd || []).map((fd: any) => {
        return {
          'fd': fd,
          'value': fs.readFileSync(fd, 'utf-8').toString()
        };
      });
      fs.writeFileSync(dump, JSON.stringify({
        'args': {
          process: process.argv,
          yargs: y
        },
        'readFds': readFds,
        'env': process.env
      }, null, ' '));
    }
    process.exit(this._exitCode);
  }

  public parsed(y: yargs.Arguments): void {
    if (!this._processed) {
      rxme.Observable.create(obs => {
        this.processAction(y, obs, 0);
      }).match(rxme.Matcher.Complete(() => { this.processParsed(y); return true; }));
    } else {
      this.processParsed(y);
    }
  }
}
