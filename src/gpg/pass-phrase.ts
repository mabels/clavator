import Validatable from './validatable';
import Warrents from './warrents';
import Warrent from './warrent';
import ApprovablePart from './approvable-part';
import RegMinMaxWarrent from './reg-min-max-warrent';

let objectId = 0;

export class PassPhrase implements Validatable {
  public readonly key: string;
  // public partCount: number;
  // public partRegex: RegExp;
  public errorText: string;
  public parts: ApprovablePart[];

  public static createPassPhrase(warrents: Warrents, reg: string, errText: string,
    minLen: number, maxLen?: number): PassPhrase {
    const regMinMaxs = warrents.map(t => new RegMinMaxWarrent(t, reg));
    for (let min = 0; min < minLen; ++min) {
      regMinMaxs[min % regMinMaxs.length].min++;
    }
    for (let max = 0; maxLen && max < maxLen; ++max) {
      regMinMaxs[max % regMinMaxs.length].max++;
    }
    return new PassPhrase(regMinMaxs, errText);
  }

  constructor(pWarrents: RegMinMaxWarrent[], errText: string) {
    this.key = `PassPhrase:${objectId++}`;
    // this.partRegex = partRegex;
    this.errorText = errText;
    // if (typeof pCountOrWarrents == 'number') {
    //   this.partCount = pCountOrWarrents;
    //   this.parts = Array(this.partCount).fill(new ApprovablePart(this));
    // } else {
      // this.partCount = pWarrents.length;
      this.parts = pWarrents.map(w => new ApprovablePart(this, w));
    // }
  }

  public valid(): boolean {
    return this.parts.filter(p => p.valid()).length == this.parts.length;
  }

  public completed(): boolean {
    return this.valid() &&
      this.parts.filter(i => i.approved.value).length == this.parts.length;
  }

  public errText(): string[] {
    const ret: string[] = [];
    // assignOnError(this.type.valid(), ret, this.type.errText);
    // assignOnError(this.masterLen.valid(), ret, this.masterLen.errText);
    // assignOnError(this.subLen.valid(), ret, this.subLen.errText);
    return ret;
  }

  public fill(js: any): void {
    // this.partCount = js['partCount'];
    // this.partRegex = js['partRegex'];
    this.errorText = js['errorText'];
    this.parts = js['parts'].map((i: any) => (new ApprovablePart(this)).fill(i));
  }

}

export default PassPhrase;
