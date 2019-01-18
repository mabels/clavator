import { observable } from 'mobx';

import {
  ObjectId,
  BooleanValue,
  Validatable,
  Warrents,
  Warrent
} from '../../model';
// import Warrent from '../../gpg/warrent';
import { DoublePassword } from './double-password';
import { DiceWare } from '../../dice-ware/dice-ware';
// import ViewWarrent from './view-warrent';
// import ViewWarrents from './view-warrents';
import { MinMax } from './min-max';
import { CharFormat } from './char-format';

export class PassPhrase extends ObjectId implements Validatable {
  public readonly readOnly: BooleanValue;
  @observable
  public readonly warrents: Warrents;
  // public errorText: string;
  public readonly doublePasswords: DoublePassword[];
  public joiner: string;

  // two Object Graphs
  // First one DoublePassport Per Warrent
  public static createPerWarrent(
    warrents: Warrents,
    diceWares: DiceWare[],
    contReg: CharFormat,
    errText: string,
    joiner: string,
    minLen: number,
    maxLen?: number
  ): PassPhrase {
    const minMaxs = MinMax.create(warrents.length, contReg, minLen, maxLen);
    return new PassPhrase(
      warrents,
      new Array(warrents.length)
        .fill(42)
        .map(
          (_, idx) =>
            new DoublePassword(
              new Warrents([warrents.get(idx)]),
              errText,
              minMaxs[idx],
              diceWares
            )
        ),
      joiner
    );
  }

  // First n DoublePassports all Warrents per DoublePassports
  public static createDoublePasswords(
    n: number,
    warrents: Warrents,
    diceWares: DiceWare[],
    contReg: CharFormat,
    errText: string,
    joiner: string,
    minLen: number,
    maxLen?: number
  ): PassPhrase {
    const minMax = MinMax.create(1, contReg, minLen, maxLen)[0];
    return new PassPhrase(
      warrents,
      new Array(n)
        .fill(42)
        .map(
          (_, idx) =>
            new DoublePassword(
              new Warrents([warrents.get(idx % warrents.length)]),
              errText,
              minMax,
              diceWares
            )
        ),
      joiner
    );
  }

  /* pWarrents: ViewWarrents, reg: string, errText: string */
  constructor(warrents: Warrents, dps: DoublePassword[], joiner = '') {
    super('PassPhrase');
    this.readOnly = new BooleanValue('readonly error');
    this.warrents = warrents;
    this.joiner = joiner;
    // this.errorText = errText;
    this.doublePasswords = dps.map(dp => dp.setPassPhrase(this));
  }

  public valid(): boolean {
    return (
      this.doublePasswords.filter(p => p.valid()).length ==
      this.doublePasswords.length
    );
  }

  public completed(): boolean {
    return (
      this.valid() &&
      this.doublePasswords.filter(i => i.warrents.approved()).length ==
        this.doublePasswords.length
    );
  }

  public errText(): string[] {
    const ret: string[] = [];
    // assignOnError(this.type.valid(), ret, this.type.errText);
    // assignOnError(this.masterLen.valid(), ret, this.masterLen.errText);
    // assignOnError(this.subLen.valid(), ret, this.subLen.errText);
    return ret;
  }

  public getPassPhrase(): string {
    if (!this.valid()) {
      throw 'getPassPhrase only allowed on valid objects';
    }
    return this.doublePasswords
      .map(dp => dp.first.password.value)
      .join(this.joiner);
  }

  public fill(js: any): void {
    js['doublePasswords'].forEach((value: string, idx: number) =>
      this.doublePasswords[idx].setPassword(value)
    );
    js['warrents'].forEach((warrent: string) =>
      this.warrents.add(new Warrent(warrent))
    );
    this.joiner = js['joiner'];
  }

  public toObj(): any {
    const ret: string[] = [];
    this.doublePasswords.forEach(dp =>
      ret.push.apply(ret, dp.warrents.toObj())
    );
    return {
      warrents: [...new Set(ret)],
      joiner: this.joiner,
      doublePasswords: this.doublePasswords.map(dp => dp.first.password.value)
    };
  }
}
