import { Pin } from './pin';
import { Gpg2CardStatus } from './card-status';
import { action, IObservableValue, observable, computed } from 'mobx';

export interface ChangeCardProps {
  readonly adminPin: Pin;
  readonly serialNo: string;
  readonly lang: string;
  readonly name: string;
  readonly login: string;
  readonly sex: string;
  readonly url: string;
}

export class ChangeCard {
  public readonly adminPin: Pin = new Pin();
  public readonly serialNo: IObservableValue<string>;
  public readonly lang: IObservableValue<string>;
  public readonly name: IObservableValue<string>;
  public readonly login: IObservableValue<string>;
  public readonly sex: IObservableValue<string>;
  public readonly url: IObservableValue<string>;

  public static fill(js: any): ChangeCard {
    return new ChangeCard({
      adminPin: Pin.fill(js['adminPin']),
      serialNo: js['serialNo'],
      lang: js['lang'],
      name: js['name'],
      login: js['login'],
      sex: js['sex'],
      url: js['url']
    });
  }

  public static fromCardStatus(
    cs: Gpg2CardStatus,
    pin: string = null
  ): ChangeCard {
    // debugger
    return ChangeCard.fill({
      adminPin: { pin: pin },
      serialNo: cs.reader.cardid,
      lang: cs.lang,
      name: cs.name,
      login: cs.login,
      sex: cs.sex,
      url: cs.url
    });
  }

  constructor(props: ChangeCardProps) {
    this.adminPin = props.adminPin;
    this.serialNo = observable.box(props.serialNo);
    this.lang = observable.box(props.lang);
    this.name = observable.box(props.name);
    this.login = observable.box(props.login);
    this.sex = observable.box(props.sex);
    this.url = observable.box(props.url);
  }

  @computed
  public get valid(): boolean {
    return (
      this.adminPin.valid &&
      this.serialNo.get().length > 0 &&
      typeof this.lang.get() == 'string' &&
      typeof this.name.get() == 'string' &&
      typeof this.login.get() == 'string' &&
      typeof this.sex.get() == 'string' &&
      typeof this.url.get() == 'string'
    );
  }
}
