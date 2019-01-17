
import { MutableString } from '../model/mutable-string';

export class RequestAscii {
  public passphrase: MutableString = new MutableString();
  public action: string;
  public fingerprint: string;

  public static fill(js: any): RequestAscii {
    let ra = new RequestAscii();
    ra.action = js['action'];
    ra.passphrase = MutableString.fill(js['passphrase']);
    ra.fingerprint = js['fingerprint'];
    return ra;
  }

}
