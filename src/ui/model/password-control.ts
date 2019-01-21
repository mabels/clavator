import { observable } from 'mobx';
import { ObjectId, StringValue, Validatable } from '../../model';
import { MinMax } from './min-max';

export class PasswordControl extends ObjectId implements Validatable {
  public readonly password: StringValue;
  public prevPassword: string;
  public readonly minMax: MinMax;

  constructor(minMax: MinMax, e: string) {
    super('PasswordControl');
    this.minMax = minMax;
    this.password = new StringValue(minMax.asRegExp(), e);
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
    // this.readonly = o['readonly'];
    return this;
  }
}
