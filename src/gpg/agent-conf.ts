import * as fs from 'fs';
import { AgentConfType, AgentLine } from './types';

const reCrNl = /\r?\n/;

function write_file(fname: string, done: (err: any) => void): void {
  fs.writeFile(fname, this.asString(), done);
}

export class AgentConf {

  public static read(str: string): AgentConfType {
    const ag = new AgentConfType(write_file);
    str.split(reCrNl).forEach((line: string) => {
      ag.add(new AgentLine(line));
    });
    return ag;
  }

  public static read_file(
    fname: string,
    done: (err: any, ag: AgentConfType) => void
  ): void {
    fs.readFile(fname, 'utf8', (err: any, data: string) => {
      if (err && err.code == 'ENOENT') {
        done(null, new AgentConfType(write_file));
        return;
      }
      if (err) {
        done(err, null);
        return;
      }
      done(null, AgentConf.read(data));
    });
  }

}
