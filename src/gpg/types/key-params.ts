import { Option, ObjectId, Validatable, assignOnError } from '../../model';

export class KeyParams extends ObjectId implements Validatable {
  public readonly type: Option<string>;
  public readonly masterLen: Option<number>;
  public readonly subLen: Option<number>;

  constructor() {
    super('KeyParams');
    this.type = new Option('RSA', ['RSA', 'DSA'], 'keyType Error');
    this.masterLen = new Option(
      4096,
      [1024, 2048, 4096, 8192],
      'master keyLength Error'
    );
    this.subLen = new Option(
      4096,
      [1024, 2048, 4096, 8192],
      'master keyLength Error'
    );
  }

  public valid(): boolean {
    return this.type.valid() && this.masterLen.valid() && this.subLen.valid();
  }

  public errText(): string[] {
    const ret: string[] = [];
    assignOnError(this.type.valid(), ret, this.type.errText);
    assignOnError(this.masterLen.valid(), ret, this.masterLen.errText);
    assignOnError(this.subLen.valid(), ret, this.subLen.errText);
    return ret;
  }

  public fill(js: any): void {
    this.type._value.set(js['type']);
    this.masterLen._value.set(js['masterLen']);
    this.subLen._value.set(js['subLen']);
  }

  public toObj(): any {
    return {
      type: this.type.value,
      masterLen: this.masterLen.value,
      subLen: this.subLen.value
    };
  }
}
