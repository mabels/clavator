import Pallet from './pallet';
import { observable } from 'mobx';
import { assignOnError } from './helper';

export class Container<T extends Pallet> {
  @observable protected pallets: T[] = [];
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
  public add(i: T): Container<T> {
    this.pallets.push(i);
    // console.log('Container:Pallets:Push', this.pallets);
    return this;
  }

  public forEach(cb: (t: T, idx?: number, ar?: T[]) => void): void {
    this.pallets.forEach(cb);
  }

  public map<A>(cb: (t: T, idx?: number, ar?: T[]) => A): A[] {
    return this.pallets.map((a, b, c) => {
      return !!a && cb(a, b, c);
    });
  }

  public find(cb: (t: T, idx?: number, ar?: T[]) => boolean): T {
    return this.pallets.find((a, b, c) => {
      return !!a && cb(a, b, c);
    });
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
    // delete this.pallets[idx];
    this.pallets[idx] = undefined;
  }

  public pop(): void {
    // console.log('i-delLast:', this.length());
    this.pallets.pop();
    // this.pallets.reverse().find((i, idx) => {
    //   if (i) {
    //     console.log('-delLast:It:', idx, this.pallets.length, this.pallets);
    //     delete this.pallets[(this.pallets.length - 1) - idx];
    //     console.log('+delLast:It:', idx, this.pallets.length, this.pallets);
    //     return true;
    //   }
    //   return false;
    // });
    // console.log('o-delLast:', this.length());
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

  public toObj(): any {
    return this.pallets.map(ws => ws.toObj());
  }
}

export default Container;
