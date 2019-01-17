import { computed, observable } from 'mobx';
import { ObjectId } from './object-id';

export class NestedFlag extends ObjectId {
  @observable private value: boolean;
  private parent?: NestedFlag;
  private children: NestedFlag[];

  constructor(val?: boolean|NestedFlag, value = false) {
    super('NestedFlag');
    this.children = [];
    if (typeof(val) == 'boolean' || !val) {
      this.parent = undefined;
      this.value = !!val;
    } else {
      this.parent = val;
      this.parent.children.push(this);
      this.value = undefined;
    }
  }

  @computed
  public get is(): boolean {
    // console.log(`GET:${this.objectId()}:`, this.value);
    if (this.value === undefined) {
      return this.parent.is;
    }
    return this.value;
  }

  public set is(v: boolean) {
    this.value = v;
    // console.log(`SET:${this.objectId()}:`, this.value);
    this.resetChildren();
  }

  private resetChildren(): void {
    this.children.forEach(nf => {
      nf.value = undefined;
      nf.resetChildren();
    });
  }

}
