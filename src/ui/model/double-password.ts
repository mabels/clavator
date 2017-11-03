import { observable } from 'mobx';
import ObjectId from '../../model/object-id';
import MinMax from './min-max';
// import BooleanValue from '../../model/boolean-value';
import ViewWarrent from './view-warrent';
import ViewWarrents from './view-warrents';
import Validatable from '../../model/validatable';
import StringValue from '../../model/string-value';
import PassPhrase from './pass-phrase';
import PasswordControl from './password-control';
import Warrents from '../../gpg/warrents';
import DiceWare from '../../dice-ware/dice-ware';

export class DoublePassword extends ObjectId implements Validatable {
  // @observable public approved: BooleanValue;
  @observable public first: PasswordControl;
  @observable public second: PasswordControl;
  @observable public diceValue: StringValue;
  @observable public readonly: boolean;
  @observable public readable: boolean;
  // public passPhrase: PassPhrase;
  public readonly warrents: ViewWarrents;
  public readonly diceWare: DiceWare;
  private passPhrase: PassPhrase;
  private readableTimer: any;
  private readableCb: (v: boolean) => void;

  constructor(warrents: Warrents, errText: string, minmaxs: MinMax, diceWare: DiceWare) {
    super('DoublePassword');
    // console.log('approved', this.objectId, approved);
    // this.approved = new BooleanValue('').set(DoublePassword.approveIfJustOne(warrents));
    this.first = new PasswordControl(minmaxs.regExp, '');
    this.second = new PasswordControl(minmaxs.regExp, '');
    this.diceWare = diceWare;
    this.diceValue = new StringValue(
          new RegExp(`^[1-6]{${diceWare.dicesCount()},${diceWare.dicesCount()}}$`),
          'dices should be between 1-6');
    this.readonly = false;
    this.readable = false;
    // this.passPhrase = passPhrase;
    this.warrents = new ViewWarrents();
    warrents.forEach(w => this.warrents.add(new ViewWarrent(w)));
  }

  // public get diceWare(): DiceWare {
  //   return this._diceWare;
  // }
  // public set diceWare(diceWare: DiceWare) {
  //   this._diceWare = diceWare;
  //   console.log('add diceWare:', this.objectId());
  //   
  // }

  public setReadableWithTimeout(v: boolean, timeout: number, cb?: (v: boolean) => void): void {
    this.readable = v;
    if (this.readableTimer) {
      if (this.readableCb) {
        this.readableCb(this.readable);
      }
      clearTimeout(this.readableTimer);
    }
    console.log('setReadableWithTimeout:', v, timeout);
    if (timeout) {
      this.readableCb = cb;
      this.readableTimer = setTimeout(() => {
        this.readable = !v;
        if (cb) {
          cb(this.readable);
        }
      }, timeout);
    } else {
      this.readable = v;
    }
  }

  public setPassPhrase(pp: PassPhrase): DoublePassword {
    this.passPhrase = pp;
    return this;
  }

  public passwordInputType(): string {
    if (this.readonly) {
      return 'password';
    }
    return !this.readable ? 'password' : 'text';
  }

  public showWarrent(): boolean {
    return this.passPhrase.warrents.length() > 1;
  }

  // @computed public get isValid(): boolean {
  //   return this.valid();
  // }

  public valid(): boolean {
    return this.first.valid() && this.second.valid() &&
      this.first.password.value === this.second.password.value;
  }

  public errText(): string[] {
    return [];
  }

  public fill(js: any): void {
    throw 'need to be impl';
    // this.approved.value = js['approved'];
    // this.first = js['part'];
    // this.second = js['verify'];
    // this.regMinMaxWarrent = ViewWarrent.fill(js['RegMinMaxWarrent']);
    // this.regMinMaxWarrent.fill();
    // this.passPhrase = js['passPhrase'];
    // return this;
  }
}

export default DoublePassword;
