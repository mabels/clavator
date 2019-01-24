import { IObservableValue, observable } from 'mobx';

export interface RequestAsciiProps {
  readonly fingerprint: string;
  readonly passphrase?: string;
  readonly action?: string;
}

export class RequestAscii {
  public readonly passphrase: string; // IObservableValue<string> = observable.box();
  public readonly fingerprint: string;
  public readonly action?: string;

  public static fill(js: any): RequestAscii {
    return new RequestAscii({
      action: js['action'],
      passphrase: js['passphrase'],
      fingerprint: js['fingerprint']
    });
  }

  public constructor(props: RequestAsciiProps) {
    this.action = props.action;
    this.passphrase = props.passphrase;
    this.fingerprint = props.fingerprint;
  }

}
