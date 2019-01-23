
import { MutableString } from '../model/mutable-string';

export interface RequestAsciiProps {
  readonly fingerprint: string;
  readonly passphrase?: string;
  readonly action?: string;
}

export class RequestAscii {
  public readonly passphrase: MutableString = new MutableString();
  public readonly action?: string;
  public readonly fingerprint: string;

  public static fill(js: any): RequestAscii {
    return new RequestAscii({
      action: js['action'],
      passphrase: js['passphrase'],
      fingerprint: js['fingerprint']
    });
  }

  public constructor(props: RequestAsciiProps) {
    this.action = props.action;
    this.passphrase._value.set(props.passphrase);
    this.fingerprint = props.fingerprint;
  }

}
