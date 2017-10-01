export class Pin {
  public pin: string;
  public match: RegExp = /.+/;

  public static fill(js: any): Pin {
    let pin = new Pin();
    pin.pin = js['pin'];
    return pin;
  }

  constructor() {
    this.pin = '';
  }

  public verify(): boolean {
    return this.verifyText().length == 0;
  }
  public verifyText(): string[] {
    let ret: string[] = [];
    if (!this.match.test(this.pin)) {
      ret.push(`Pin does not match:${this.match.toString()}`);
    }
    return ret;
  }
}

export function AdminPin(): Pin {
  let ret = new Pin();
  ret.match = /[0-9]{8}/;
  return ret;
}

export default Pin;
