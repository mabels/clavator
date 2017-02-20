
import Pin  from './pin';
import MutableString from './mutable_string';

export class KeyToYubiKey {
  public fingerprint: string = "";
  public app_id: string = "";
  public admin_pin: Pin = new Pin();
  public passphrase: MutableString = new MutableString();

  public static fill(js: any) : KeyToYubiKey {
    let ra = new KeyToYubiKey();
    ra.fingerprint = js['fingerprint']
    ra.app_id = js['app_id']
    ra.admin_pin.pin = js['admin_pin']['pin']
    ra.passphrase = MutableString.fill(js['passphrase'])
    return ra;
  }

  public verify() : boolean {
    return this.verifyText().length == 0
  }

  public verifyText() : string[] {
    let ret : string[] = [];
    if (this.fingerprint.length == 0) {
      ret.push("fingerprint had to set.")
    }
    if (this.app_id.length == 0) {
      ret.push("app-id had to be set.")
    }
    ret = ret.concat(this.admin_pin.verifyText())
    if (this.passphrase.value == null || this.passphrase.value.length <= 8) {
      ret.push("passphrase had to be set.")
    }
    return ret;
  }
}

export default KeyToYubiKey;
