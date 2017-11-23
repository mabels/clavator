import * as path from 'path';
import * as fs from 'fs';
import * as yargs from 'yargs';

export interface ParsedAction {
  (y: yargs.Arguments, state: GpgMockState): boolean; // returns true stopped
}

interface StdOut {
  fname: string;
  value: string;
}

export default class GpgMockState {
  public action: ParsedAction[];
  public _exitCode: number;
  public stdOut: StdOut[];
  public _processed: boolean;

  public static create(): GpgMockState {
    const ret = new GpgMockState();
    return ret;
  }

  constructor() {
    this.action = [];
    this._exitCode = 0;
    this.stdOut = [];
  }

  public processed(): void {
    this._processed = true;
  }

  public stdout(str: string): void {
    this.stdOut.push({fname: '', value: str});
  }

  public stdoutMock(mockFname: string, str: string): void {
    this.stdOut.push({fname: mockFname, value: str});
  }

  public exitCode(code: number): void {
    this._exitCode = code;
  }

  public onParsed(action: ParsedAction): void {
    this.action.push(action);
  }

  public parsed(y: yargs.Arguments): void {
    if (!this._processed) {
      this._processed = !!this.action.find(action => {
        const ret = action(y, this);
        return ret;
      });
    }
    if (this._processed) {
      this.stdOut.forEach(i => console.log(i.value));
    }
    if (process.env['NODEEXECTRANSACTION'] && y.homedir && fs.existsSync(y.homedir)) {
      const dump = path.join(y.homedir || '', `${process.env['NODEEXECTRANSACTION']}.dump`);
      const readFds = (y.passphraseFd || []).map((fd: any) => { return {
        'fd': fd,
        'value': fs.readFileSync(fd, 'utf-8').toString()
      }; });
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

}
