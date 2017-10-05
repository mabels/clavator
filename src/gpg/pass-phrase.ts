import Validatable from './validatable';
import Warrent from './warrent';
import Part from './part';

let objectId = 0;

export class PassPhrase implements Validatable {
  public readonly key: string;
  public partCount: number;
  public partRegex: RegExp;
  public errorText: string;
  public parts: Part[];

  constructor(pCountOrWarrents: Warrent[] | number, partRegex: RegExp, errText: string) {
    this.key = '' + objectId++;
    this.partRegex = partRegex;
    this.errorText = errText;
    if (typeof pCountOrWarrents == 'number') {
      this.partCount = pCountOrWarrents;
      this.parts = Array(this.partCount).fill(new Part(this));
    } else {
      this.partCount = pCountOrWarrents.length;
      this.parts = pCountOrWarrents.map(w => new Part(this, w));
    }
  }

  public valid(): boolean {
    return this.parts.filter(p => p.valid()).length == this.parts.length;
  }

  public errText(): string[] {
    const ret: string[] = [];
    // assignOnError(this.type.valid(), ret, this.type.errText);
    // assignOnError(this.masterLen.valid(), ret, this.masterLen.errText);
    // assignOnError(this.subLen.valid(), ret, this.subLen.errText);
    return ret;
  }

  public fill(js: any): void {
    this.partCount = js['partCount'];
    this.partRegex = js['partRegex'];
    this.errorText = js['errorText'];
    this.parts = js['parts'].map((i: any) => (new Part(this)).fill(i));
  }

}

export default PassPhrase;