import { observable } from 'mobx';
import ObjectId from '../../model/object-id';
import StringValue from '../../model/string-value';
import Validateable from '../../model/validatable';

class PasswordControl extends ObjectId implements Validateable {
  @observable public password: StringValue;
  @observable public readonly: boolean;
  // @observable public readable: boolean;
  public dicedPassword: string;
  // public readonly match: RegExp;

  constructor(match: RegExp, e: string) {
    super('PasswordControl');
    this.password = new StringValue(match, e);
    // this.match = this.password.match; // alias
  }

  public match(): RegExp {
    return this.password.match;
  }

  public valid(): boolean {
    return this.password.valid();
  }

  public errText(): string[] {
    return this.password.errText();
  }

  public fill(o: any): PasswordControl {
    this.password.fill(o['value']);
    // this.readable = o['readable'];
    this.readonly = o['readonly'];
    return this;
  }

}

export default PasswordControl;
