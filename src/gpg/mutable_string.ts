export class MutableString {
  public value: string = null;
  public static fill(js: any) : MutableString {
    let m = new MutableString();
    m.value = js['value']
    return m;
  }
}

export default MutableString;
