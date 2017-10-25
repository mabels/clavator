export class RespondAscii {
  public action: string;
  public fingerprint: string;
  public data: string;
  public static fill(js: any): RespondAscii {
    return new RespondAscii(js['action'], js['fingerprint'], js['data']);
  }
  constructor(action: string, fingerprint: string, data: string) {
    this.action = action;
    this.fingerprint = fingerprint;
    this.data = data;
  }
}

export default RespondAscii;
