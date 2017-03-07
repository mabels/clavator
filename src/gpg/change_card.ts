
import Pin from './pin';

export class ChangeCard {
  public adminPin: Pin;
  public serialNo: string;

  public lang: string;
  public name: string;
  public login: string;
  public sex: string;
  public url: string;

  public static fill(js: any) {
    let cc = new ChangeCard();
    cc.adminPin = Pin.fill(js['adminPin'])
    cc.serialNo = js['serialNo']
    cc.lang = js['lang']
    cc.name = js['name']
    cc.login = js['login']
    cc.sex = js['sex']
    cc.url = js['url']
    return cc;
    // return new ChangeCard(js['action'], js['params']);
  }

  public valid(): boolean {
    // return !!(['name','login','sex','url'].find((a)=>this.action==a)) &&
    //   this.params.length>0 && this.serialNo.length > 0 &&
    //   this.adminPin.verify()
    return false;
  }
}

export default ChangeCard;