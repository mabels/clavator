import Pin from './pin';
import { Gpg2CardStatus } from './card-status';

export class ChangeCard {
  public adminPin: Pin = new Pin();
  public serialNo: string;

  public lang: string;
  public name: string;
  public login: string;
  public sex: string;
  public url: string;

  public static fill(js: any): ChangeCard {
    let cc = new ChangeCard();
    cc.adminPin = Pin.fill(js['adminPin']);
    cc.serialNo = js['serialNo'];
    cc.lang = js['lang'];
    cc.name = js['name'];
    cc.login = js['login'];
    cc.sex = js['sex'];
    cc.url = js['url'];
    return cc;
    // return new ChangeCard(js['action'], js['params']);
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

  public valid(): boolean {
    return (
      this.adminPin.verify() &&
      this.serialNo.length > 0 &&
      typeof this.lang == 'string' &&
      typeof this.name == 'string' &&
      typeof this.login == 'string' &&
      typeof this.sex == 'string' &&
      typeof this.url == 'string'
    );
  }
}

export default ChangeCard;
