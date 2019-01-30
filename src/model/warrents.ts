// import Validatable from './validatable';
// import StringValue from './string-value';
import { Container } from './container';
import { Warrent } from './warrent';
import { computed } from 'mobx';

export class Warrents extends Container<Warrent> {
  constructor(ws: Warrent[] = []) {
    super(() => {
      return new Warrent();
    });
    ws.forEach(w => this.add(w));
  }

  @computed
  public get valid(): boolean {
    // debugger;
    if (this.pallets.find(i => !i.valid)) {
      // console.log('Warrents:elements:!valid');
      return false;
    }
    const reduced = this.pallets.map(i => i)
      .sort((a, b) => {
        if (a.warrent.value < b.warrent.value) {
          return -1;
        } else if (a.warrent.value > b.warrent.value) {
          return 1;
        }
        return 0;
      })
      .filter((x, i, a) => !i || x.warrent.value != a[i - 1].warrent.value);
    // console.log(`Warrents:elements:${reduced.length}:${this.pallets.length}`,
    // this.pallets.map(i => i.warrent.value));
    return reduced.length == this.pallets.length;
  }
}
