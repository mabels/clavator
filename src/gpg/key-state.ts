export class KeyState {
  public id: number;
  public mode: number;
  public bits: number;
  public maxpinlen: number;
  public pinretry: number;
  public sigcount: number;
  public cafpr: number;
  public fpr: string;
  public fprtime: number;

  public static jsfill(js: any): KeyState {
    let ret = new KeyState();
    ret.jsfill(js);
    return ret;
  }

  constructor() {
    this.id = 0;
    this.mode = 0;
    this.bits = 0;
    this.maxpinlen = 0;
    this.pinretry = 0;
    this.sigcount = 0;
    this.cafpr = 0;
  }

  public jsfill(js: any): KeyState {
    this.id = js['id'];
    this.mode = js['mode'];
    this.bits = js['bits'];
    this.maxpinlen = js['maxpinlen'];
    this.pinretry = js['pinretry'];
    this.sigcount = js['sigcount'];
    this.cafpr = js['cafpr'];
    this.fpr = js['fpr'];
    this.fprtime = js['fprtime'];
    return this;
  }

  public eq(o: KeyState): boolean {
    return (
      this.id == o.id &&
      this.mode == o.mode &&
      this.bits == o.bits &&
      this.maxpinlen == o.maxpinlen &&
      this.pinretry == o.pinretry &&
      this.sigcount == o.sigcount &&
      this.cafpr == o.cafpr &&
      this.fpr == o.fpr &&
      this.fprtime == o.fprtime
    );
  }
}
