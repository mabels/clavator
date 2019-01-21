import { action, computed } from 'mobx';
import { Container, Warrents } from '../../model';
import { ViewWarrent } from './view-warrent';

export class ViewWarrents extends Container<ViewWarrent> {
  // private warrents: Warrents;

  public static from(warrents: Warrents, strReg?: string): ViewWarrents {
    const ret = new ViewWarrents();
    warrents.map(w => ret.add(new ViewWarrent(w/*, strReg*/)));
    if (warrents.length == 1) {
      // single warrents are approved per default
      ret.first()._approved.set(true);
    }
    return ret;
  }

  public constructor() {
    super(() => { throw 'do not use @home'; });
  }

  public approved(): boolean {
    return this.pallets.length == 1 || !this.pallets.find(t => !t.approved);
  }

  @computed public get lock(): boolean {
    console.log('lock:', this.pallets.map(t => t.approved));
    return this.pallets.length > 1 && !!this.pallets.find(t => t.approved);
  }

  public non(): boolean {
    return !this.pallets.find(t => t.approved);
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

  @action
  public completed(): boolean {
    if (this.pallets.length == 1 && !this.pallets[0].approved) {
      throw 'das darf nicht sein';
      // console.log('Set Approved for lenght==1');
      // this.pallets[0].approved.set(true);
    }
    // debugger;
    const ret = this.valid();
    // console.log('AppWarrents:completed:', ret);
    return ret;
  }

  public toObj(): any {
    return this.pallets.map(ws => ws.warrent.toObj());
  }

}
