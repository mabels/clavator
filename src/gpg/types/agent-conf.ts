import { AgentLine } from './agent-line';

export declare type AgentConfWriteFile = (fname: string, done: (err: any) => void) => void;

export class AgentConfType {
  public readonly lines: AgentLine[] = [];
  public readonly byKey: { [key: string]: AgentLine[] } = {};

  public readonly write_file: AgentConfWriteFile;

  public constructor(write_file: AgentConfWriteFile) {
    this.write_file = write_file;
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
    let lines = this.lines.map(al => {
      return al.getLine();
    });
    let postcr = '';
    if (lines.length && lines[lines.length - 1].trim().length) {
      postcr = '\n';
    }
    return lines.join('\n') + postcr;
  }

}
