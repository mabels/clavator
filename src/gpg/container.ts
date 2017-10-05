import Pallet from './pallet';
import { observable } from 'mobx';
import { assignOnError } from './helper';

export class Container<T extends Pallet> {
  @observable private pallets: T[] = [];
  public factory: () => T;
  constructor(factory: () => T) {
    this.factory = factory;
  }
  public length(): number {
    return this.pallets.filter(i => i).length;
  }

  public errText(): string[] {
    let ret: string[] = [];
    for (let i of this.pallets) {
      if (i) {
        assignOnError(i.valid(), ret, i.errText());
      }
    }
    return ret;
  }
  public add(i: T): void {
    if (!i.key) {
      i.key = '' + (this.pallets.length + 1);
    }
    this.pallets.push(i);
  }

  public map(cb: (t: T, idx?: number) => any): any[] {
    return this.pallets.map(cb);
  }

  public push(t: T): T {
    this.pallets.push(t);
    return t;
  }

  public first(): T {
    return this.pallets.find(i => !!i);
  }

  public last(): T {
    // uncool
    return this.pallets.reverse().find(i => !!i);
  }

  public get(idx: number): T {
    return this.pallets[idx];
  }

  public del(idx: number): void {
    delete this.pallets[idx];
  }
  public valid(): boolean {
    let ret = true;
    for (let sk of this.pallets) {
      if (sk) {
        ret = ret && sk.valid();
      }
    }
    return ret;
  }
  public fill(js: any): void {
    this.pallets = [];
    for (let i of js['pallets']) {
      if (i) {
        let t: T = this.factory();
        t.fill(i);
        this.add(t);
      }
    }
  }
}

export default Container;
