import * as rxme from 'rxme';

export default class GpgVersion {
  public readonly gpg: string;
  public readonly style: string;
  public readonly version: string;

  public static match(cb: rxme.MatcherCallback<GpgVersion>): rxme.MatcherCallback {
    return rxme.Matcher.Type<GpgVersion>(GpgVersion, cb);
  }

  constructor(versionStr: string) {
    // gpg (GnuPG/MacGPG2) 2.2.0
    const r = versionStr.match(/^(\S+)\s+\(([^\)]+)\)\s+(\S+)$/);
    this.gpg = r[1];
    this.style = r[2];
    this.version = r[3];
  }

  public versionNumber(): number {
    const ret = this.version.split('.').reverse()
      .map((part, idx) => parseInt(part, 10) * Math.pow(1000, idx))
      .reduce((p, c) => p + c, 0);
    // console.log(this.version, ret);
    return ret;
  }

  public asString(): string {
    return `${this.gpg} (${this.style}) ${this.version}`;
  }
}
