import { computed, observable, IObservableValue } from 'mobx';
import { ObjectId } from './object-id';

export class NestedFlag extends ObjectId {
  private readonly value: IObservableValue<boolean>;
  private readonly parent?: NestedFlag;
  private readonly children: NestedFlag[];

  constructor(val?: boolean|NestedFlag, value = false) {
    super('NestedFlag');
    this.children = [];
    if (typeof(val) == 'boolean' || !val) {
      this.parent = undefined;
      this.value = observable.box(!!val);
    } else {
      this.parent = val;
      this.parent.children.push(this);
      this.value = observable.box(undefined);
    }
  }

  @computed
  public get is(): boolean {
    // console.log(`GET:${this.objectId()}:`, this.value);
    if (this.value.get() === undefined) {
      return this.parent.is;
    }
    return this.value.get();
  }

  public set is(v: boolean) {
    this.value.set(v);
    // console.log(`SET:${this.objectId()}:`, this.value);
    this.resetChildren();
  }

  private resetChildren(): void {
    this.children.forEach(nf => {
      nf.value.set(undefined);
      nf.resetChildren();
    });
  }

}
