import {
  assignOnError,
  Pallet,
  ObjectId,
  StringValue } from '../../model';
import { computed } from 'mobx';

const EmailRegExp = new RegExp(
  [
    `^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*`,
    `@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+[a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))`,
    `(:[0-9]{1,5})?$`
  ].join(''),
  'i'
);

export class KeyGenUid extends ObjectId implements Pallet {
  public readonly name: StringValue = new StringValue(
    /^([A-Z][a-z]*\s*)+$/,
    'name error'
  );
  public readonly email: StringValue = new StringValue(EmailRegExp, 'email error');
  public readonly comment: StringValue = new StringValue(/.*/, 'comment error');

  constructor() {
    super('KeyGenUid');
  }

  public fill(js: any): void {
    StringValue.fill(js['name'] || {}, this.name);
    StringValue.fill(js['email'] || {}, this.email);
    StringValue.fill(js['comment'] || {}, this.comment);
    // console.log(`KeyGenUid:${this.objectId()}:${js}:${this.name.value}:${this.email.value}:${this.comment.value}`);
  }

  @computed
  public get valid(): boolean {
    // console.log('KeyGenUid:', this.key, this.name.valid(),
    //    this.email.valid(), this.comment.valid());
    return this.name.valid && this.email.valid && this.comment.valid;
  }

  @computed
  public get errText(): string[] {
    let ret: string[] = [];
    assignOnError(this.name.valid, ret, this.name.errText);
    assignOnError(this.email.valid, ret, this.email.errText);
    assignOnError(this.comment.valid, ret, this.comment.errText);
    return ret;
  }

  public toString(): string {
    const name = this.name.value.trim();
    const email = this.email.value.trim();
    const comment = this.comment.value.trim();
    let tmp = name + ' (' + comment + ') <' + email + '>';
    if (comment == '') {
      tmp = name + ' <' + email + '>';
    }
    return tmp;
  }

  public toObj(): any {
    // console.log('KeyUid:', this.objectId(), this.name.value, this.email.value, this.comment.value);
    return {
      name: { value: this.name.value },
      email: { value: this.email.value },
      comment: { value: this.comment.value }
    };
  }
}
