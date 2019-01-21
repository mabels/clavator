export class AgentLine {
  public nr: number;
  private readonly line: string;
  public readonly key: string;
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
