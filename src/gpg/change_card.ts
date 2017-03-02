
import Pin from './pin';

export class ChangeCard {
  public adminPin: Pin;
  public serialNo: string;
  public action: string;
  public params: string[]
  // constructor(action: string, params: string[]) {
  //   this.action = action;
  //   this.params = params;
  // }

  public static fill(js: any) {
    let cc = new ChangeCard();
    cc.adminPin = Pin.fill(js['adminPin'])
    cc.serialNo = js['serialNo']
    cc.action = js['action']
    cc.params = js['params']
    return cc;
    // return new ChangeCard(js['action'], js['params']);
  }

  public valid() : boolean {
    return !!(['name','login','sex','url'].find((a)=>this.action==a)) &&
      this.params.length>0 && this.serialNo.length > 0 &&
      this.adminPin.verify()
  }
}

export default ChangeCard;