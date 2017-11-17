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
import InputDiceWare from '../components/controls/input-dice-ware';
import CharFormat from './char-format';

export class DoublePassword extends ObjectId implements Validatable {
  // @observable public approved: BooleanValue;
  @observable public first: PasswordControl;
  @observable public second: PasswordControl;
  @observable public diceValue: StringValue;
  @observable public readonly: boolean;
  @observable public readable: boolean;
  // public passPhrase: PassPhrase;
  public readonly warrents: ViewWarrents;
  public readonly diceWares: DiceWare[];
  private currentDiceWare: DiceWare;
  private passPhrase: PassPhrase;
  private readableTimer: any;
  private readableCb: (v: boolean) => void;
  public inputDiceWare: InputDiceWare;

  constructor(warrents: Warrents, errText: string, minmaxs: MinMax, diceWares: DiceWare[]) {
    super('DoublePassword');
    // console.log('approved', this.objectId, approved);
    // this.approved = new BooleanValue('').set(DoublePassword.approveIfJustOne(warrents));
    this.first = new PasswordControl(minmaxs, '');
    this.second = new PasswordControl(minmaxs, '');
    if (diceWares) {
      this.diceWares = diceWares;
      this.currentDiceWare = this.diceWares[0];
      // console.log('DoublePassword', this.objectId(), this);
      this.diceValue = new StringValue(
            new RegExp(`^[1-6]{${this.diceWare().dicesCount()},${this.diceWare().dicesCount()}}$`),
            'dices should be between 1-6');
    }
    this.readonly = false;
    this.readable = false;
    // this.passPhrase = passPhrase;
    this.warrents = new ViewWarrents();
    warrents.forEach(w => this.warrents.add(new ViewWarrent(w)));
  }

  public diceWare(): DiceWare {
    return this.currentDiceWare;
  }

  public setInputDiceWare(idw: InputDiceWare): void {
    this.inputDiceWare = idw;
  }

  public selectDiceWare(fname: string): void {
    this.currentDiceWare = this.diceWares.find(dw => dw.fname == fname);
    this.diceValue.match = new RegExp(`^[1-6]{${this.diceWare().dicesCount()},${this.diceWare().dicesCount()}}$`);
  }

  // public get diceWare(): DiceWare {
  //   return this._diceWare;
  // }
  // public set diceWare(diceWare: DiceWare) {
  //   this._diceWare = diceWare;
  //   console.log('add diceWare:', this.objectId());
  // }

  public setReadableWithTimeout(v: boolean, timeout: number, cb?: (v: boolean) => void): void {
    this.readable = v;
    if (this.readableTimer) {
      if (this.readableCb) {
        this.readableCb(this.readable);
      }
      clearTimeout(this.readableTimer);
    }
    // console.log('setReadableWithTimeout:', v, timeout);
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

  public generateRandom(): void {
    let cf = this.first.minMax.contReg;
    if (cf.dist() == 0) {
      cf = CharFormat.password();
    }
    const vector = cf.vector();
    const random = (new Array(this.first.minMax.max)).fill(0)
      .map(_ => vector[DiceWare.oneThrow(0, vector.length - 1)]).join('');
    const dp = this;
    if (
        (dp.first.password.value.length == 0 &&
         dp.second.password.value.length == 0) ||
        (dp.first.password.value == dp.first.prevPassword &&
         dp.second.password.value == dp.second.prevPassword)) {
      dp.first.prevPassword = dp.first.password.value = random;
      dp.second.prevPassword = dp.second.password.value = random;
      dp.setReadableWithTimeout(true, 10000, (v) => { /* */ });
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
