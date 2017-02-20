export class Pin {
  public pin: string = "";
  public match: RegExp = /.*/;
  
  public verify() : boolean {
    return this.verifyText().length == 0;
  }
  public verifyText() : string[] {
    let ret : string[] = [];
    if (!this.match.test(this.pin)) {
      ret.push(`Pin does not match:${this.match.toString()}`) 
    }
    return ret;
  }
}

export default Pin;