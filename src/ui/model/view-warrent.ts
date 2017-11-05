import { observable } from 'mobx';
import ObjectId from '../../model/object-id';
import Pallet from '../../model/pallet';
import Warrent from '../../gpg/warrent';

export class ViewWarrent extends ObjectId implements Pallet {
  public readonly warrent: Warrent;
  // public readonly contentReg: string;
  // public min: number;
  // public max: number;
  @observable
  public approved: boolean;

  public static fill(o: any): ViewWarrent {
    let ret = new ViewWarrent(new Warrent() /*, o['contentReg'] */);
    ret.warrent.fill(o['warrent']);
    // ret.min = o['min'] || 0;
    // ret.max = o['max'] || 0;
    return ret;
  }

  constructor(warrent: Warrent/* , contentReg = '.' */) {
    super('ViewWarrent');
    this.warrent = warrent;
    // this.contentReg = contentReg;
    this.approved = false;
    // this.min = 0;
    // this.max = 0;
  }

  // public createReg(): RegExp {
  //   let strMax = '';
  //   if (this.max > 0) {
  //     strMax = '' + this.max;
  //   }
  //   return new RegExp(`^${this.contentReg}{${this.min},${strMax}}$`);
  // }

  // public toString(): string {
  //   return ;
  // }

  public valid(): boolean {
    return this.warrent.valid() && this.approved;
  }

  public errText(): string[] {
    throw 'missing impl';
    // return ['WTF'];
  }

  public fill(o: any): void {
    throw 'missing impl';
    // return null;
  }

  public toObj(): any {
    return {
      warrent: this.warrent.toObj(),
      approved: this.approved
    };
  }

}

export default ViewWarrent;
