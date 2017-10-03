import { assignOnError } from './helper';
import Pallet from './pallet';
import StringValue from './string-value';

const EmailRegExp = new RegExp([`^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*`,
`@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+[a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))`,
`(:[0-9]{1,5})?$`].join(''), 'i');

export class KeyGenUid implements Pallet {
  public key: string;
  public name: StringValue = new StringValue(/^([A-Z][a-z]*\s*)+$/, 'name error');
  public email: StringValue = new StringValue(EmailRegExp, 'email error');
  public comment: StringValue = new StringValue(/.*/, 'comment error');

  public fill(js: any): void {
    StringValue.fill(js['name'] || {}, this.name);
    StringValue.fill(js['email'] || {}, this.email);
    StringValue.fill(js['comment'] || {}, this.comment);
  }

  public valid(): boolean {
    return this.name.valid() && this.email.valid() &&
      this.comment.valid();
  }

  public errText(): string[] {
    let ret: string[] = [];
    assignOnError(this.name.valid(), ret, this.name.errText());
    assignOnError(this.email.valid(), ret, this.email.errText());
    assignOnError(this.comment.valid(), ret, this.comment.errText());
    return ret;
  }

  public toString(): string {
    let name = this.name.value.trim();
    let email = this.email.value.trim();
    let comment = this.comment.value.trim();
    let tmp = name + ' (' + comment + ') <' + email + '>';
    if (comment == '') {
      tmp = name + ' <' + email + '>';
    }
    return tmp;
  }
}

export default KeyGenUid;
