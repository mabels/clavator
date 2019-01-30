import { Pallet } from './pallet';
import { observable, computed, action, IObservableArray } from 'mobx';
import { assignOnError } from './helper';
import { access } from 'fs-extra';

export class Container<T extends Pallet> {
  protected readonly pallets: IObservableArray<T> = observable.array([]);
  public readonly factory: () => T;

  constructor(factory: () => T) {
    this.factory = factory;
  }

  @computed
  public get length(): number {
    return this.pallets.filter(i => i).length;
  }

  @computed
  public get errText(): string[] {
    let ret: string[] = [];
    for (let i of this.pallets) {
      if (i) {
        assignOnError(i.valid, ret, i.errText);
      }
    }
    return ret;
  }

  @action
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

  @action
  public push(t: T): T {
    this.pallets.push(t);
    return t;
  }

  public first(): T {
    return this.pallets.find(i => !!i);
  }

  public tail(): T[] {
    return this.pallets.filter(i => !!i).slice(1);
  }

  public last(): T {
    let my = undefined;
    this.pallets.forEach(i => {
      if (i) {
        my = i;
      }
    });
    return my;
  }

  public get(idx: number): T {
    return this.pallets[idx];
  }

  @action
  public del(idx: number): void {
    // delete this.pallets[idx];
    this.pallets[idx] = undefined;
  }

  @action
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

  @computed
  public get valid(): boolean {
    let ret = true;
    for (let sk of this.pallets) {
      if (sk) {
        ret = ret && sk.valid;
      }
    }
    return ret;
  }

  public fill(js: any): void {
    this.pallets.splice(0, this.pallets.length);
    for (let i of js['pallets']) {
      if (i) {
        const t: T = this.factory();
        t.fill(i);
        this.add(t);
      }
    }
  }

  public toObj(): any {
    return this.pallets.map(ws => ws.toObj());
  }
}
