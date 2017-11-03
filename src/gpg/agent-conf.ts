
import * as fs from 'fs';

const reCrNl = /\r?\n/;

export class AgentLine {
  public nr: number;
  private line: string;
  public key: string;
  public value: string;
  constructor(line: string) {
    this.nr = -1;
    let trimmed = line.trim();
    if (!trimmed.length) {
      this.key = '';
      this.value = '';
      this.line = line;
    } else if (trimmed[0] == '#') {
      this.key = '#';
      this.value = trimmed.substring(1);
      this.line = line;
    } else {
      this.key = trimmed.split(/\s+/, 1)[0];
      this.value = trimmed.substring(this.key.length).trim();
    }
  }
  public getLine(): string {
    if (this.key == '' || this.key == '#') {
      return this.line;
    }
    return this.key + ' ' + this.value;
  }
}
export class AgentConf {
  public lines: AgentLine[] = [];
  public byKey: { [key: string]: AgentLine[] } = {};

  public static read_file(fname: string, done: (err: any, ag: AgentConf) => void): void {
    fs.readFile(fname, 'utf8', (err: any, data: string) => {
      if (err && err.code == 'ENOENT') {
        done(null, new AgentConf());
        return;
      }
      if (err) {
        done(err, null);
        return;
      }
      done(null, AgentConf.read(data));
    });
  }

  public static read(str: string): AgentConf {
    let ag = new AgentConf();
    str.split(reCrNl).forEach((line: string) => {
      ag.add(new AgentLine(line));
    });
    return ag;
  }

  public find(key: string): AgentLine[] {
    return this.byKey[key] || [];
  }
  public add(al: AgentLine): void {
    this.byKey[al.key] = this.byKey[al.key] || [];
    // hack the missing predeclation of includes ES7
    if (!(<any>this.byKey[al.key])['includes'](al)) {
      al.nr = this.lines.length;
      this.byKey[al.key].push(al);
      this.lines.push(al);
    }
  }

  public asString(): string {
    let lines = this.lines.map((al) => { return al.getLine(); });
    let postcr = '';
    if (lines.length && lines[lines.length - 1].trim().length) {
      postcr = '\n';
    }
    return lines.join('\n') + postcr;
  }

  public write_file(fname: string, done: (err: any) => void): void {
    fs.writeFile(fname, this.asString(), done);
  }

}