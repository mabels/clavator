import { action } from 'mobx';
// import Validatable from './validatable';
// import StringValue from './string-value';
import Container from '../../model/container';
import Warrent from '../../gpg/warrent';
import Warrents from '../../gpg/warrents';
import ApprovableWarrent from './approvable-warrent';

export class ApprovableWarrents extends Container<ApprovableWarrent> {
  // private warrents: Warrents;

  public static from(warrents: Warrents): ApprovableWarrents {
    const ret = new ApprovableWarrents();
    warrents.map(w => ret.add(new ApprovableWarrent(w)));
    if (warrents.length() == 1) {
      // single warrents are approved per default
      ret.first().approved.set(true);
    }
    return ret;
  }

  constructor() {
    super(() => { throw 'do not use @home'; });
  }

  public non(): boolean {
    return !this.pallets.find(t => t.approved.value);
  }

  // public valid(): boolean {
  //   if (this.pallets.length == 1 && !this.pallets[0].approved.value) {
  //     console.log('Set Approved for lenght==1');
  //     this.pallets[0].approved.set(true);
  //     return false;
  //   }
  //   const ret = super.valid();
  //   console.log('AppWarrents:valid:', ret, this.pallets.map(i => i.valid()));
  //   return ret;
  // }

  @action.bound public completed(): boolean {
    if (this.pallets.length == 1 && !this.pallets[0].approved.value) {
      console.log('Set Approved for lenght==1');
      this.pallets[0].approved.set(true);
    }
    const ret = this.valid();
    // console.log('AppWarrents:completed:', ret);
    return ret;
  }

}

export default ApprovableWarrents;
