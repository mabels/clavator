// import { observable } from 'mobx';
import ObjectId from '../../model/object-id';
import BooleanValue from '../../model/boolean-value';
import Validatable from '../../model/validatable';
import Warrents from '../../gpg/warrents';
// import Warrent from '../../gpg/warrent';
import DoublePassword from './double-password';
import DiceWare from '../../dice-ware/dice-ware';
// import ViewWarrent from './view-warrent';
// import ViewWarrents from './view-warrents';
import MinMax from './min-max';

export class PassPhrase extends ObjectId implements Validatable {
  public readonly readOnly: BooleanValue;
  public readonly warrents: Warrents;
  // public errorText: string;
  public readonly doublePasswords: DoublePassword[];
  public readonly joiner: string;

  // two Object Graphs
  // First one DoublePassport Per Warrent
  public static createPerWarrent(warrents: Warrents, diceWare: DiceWare,
    contReg: string, errText: string, joiner: string, minLen: number, maxLen?: number): PassPhrase {
    const minMaxs = MinMax.create(warrents.length(), contReg, minLen, maxLen);
    return new PassPhrase(warrents,
      (new Array(warrents.length())).fill(42).map((_, idx) =>
        new DoublePassword(new Warrents([warrents.get(idx)]), errText, minMaxs[idx], diceWare)),
        joiner);
  }

  // First n DoublePassports all Warrents per DoublePassports
  public static createDoublePasswords(n: number, warrents: Warrents, diceWare: DiceWare,
    contReg: string, errText: string, joiner: string, minLen: number, maxLen?: number): PassPhrase {
    const minMax = MinMax.create(1, contReg, minLen, maxLen)[0];
    return new PassPhrase(warrents,
      (new Array(n)).fill(42).map((_, idx) => new DoublePassword(
        new Warrents([warrents.get(idx % warrents.length())]), errText, minMax, diceWare)),
        joiner);
  }

  /* pWarrents: ViewWarrents, reg: string, errText: string */
  constructor(warrents: Warrents, dps: DoublePassword[], joiner: string) {
    super('PassPhrase');
    this.readOnly = new BooleanValue('readonly error');
    this.warrents = warrents;
    this.joiner = joiner;
    // this.errorText = errText;
    this.doublePasswords = dps.map(dp => dp.setPassPhrase(this));
  }

  public valid(): boolean {
    return this.doublePasswords.filter(p => p.valid()).length == this.doublePasswords.length;
  }

  public completed(): boolean {
    return this.valid() &&
      this.doublePasswords.filter(i => i.warrents.approved()).length == this.doublePasswords.length;
  }

  public errText(): string[] {
    const ret: string[] = [];
    // assignOnError(this.type.valid(), ret, this.type.errText);
    // assignOnError(this.masterLen.valid(), ret, this.masterLen.errText);
    // assignOnError(this.subLen.valid(), ret, this.subLen.errText);
    return ret;
  }

  public fill(js: any): void {
    throw 'need implementation';
    // this.partCount = js['partCount'];
    // this.partRegex = js['partRegex'];
    // this.readonly = js['readonly'];
    // this.errorText = js['errorText'];
    // this.parts = [];
    // js['parts'].forEach((i: any) => {
    //   new DoublePassword(this,
    //    RegMinMaxWarrent.fill(i), this.parts).fill(i));
    //   });
  }

  public toObj(): any {
    const ret: string[] = [];
    this.doublePasswords.forEach(dp => ret.push.apply(ret, dp.warrents.toObj()));
    return {
      approvedWarrents: [...new Set(ret)],
      value: this.doublePasswords.map(dp => dp.first.password.value).join(this.joiner)
    };
  }

}

export default PassPhrase;
