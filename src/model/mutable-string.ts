import { observable } from 'mobx';

export class MutableString {
  @observable
  public value: string = null;
  public static fill(js: any): MutableString {
    let m = new MutableString();
    if (js) {
      m.value = js['value'];
    }
    return m;
  }
}

export default MutableString;
