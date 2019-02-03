import { IObservableValue, observable } from 'mobx';

export interface RequestAsciiProps {
  readonly fingerprint: string;
  readonly passphrase?: string;
  readonly action?: string;
}

export class RequestAscii {
  public readonly passphrase: IObservableValue<string>;
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
    this.passphrase = observable.box(props.passphrase || '');
    this.fingerprint = props.fingerprint;
  }

}
