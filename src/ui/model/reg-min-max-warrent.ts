import Pallet from '../../model/pallet';
import Warrent from '../../gpg/warrent';

export class RegMinMaxWarrent implements Pallet {
  public key: string;
  public readonly warrent: Warrent;
  public readonly contentReg: string;
  public min: number;
  public max: number;

  public static fill(o: any): RegMinMaxWarrent {
    let ret = new RegMinMaxWarrent(new Warrent(), o['contentReg']);
    ret.warrent.fill(o['warrent']);
    ret.min = o['min'] || 0;
    ret.max = o['max'] || 0;
    return ret;
  }

  constructor(warrent: Warrent, contentReg: string) {
    this.warrent = warrent;
    this.contentReg = contentReg;
    this.min = 0;
    this.max = 0;
  }

  public createReg(): RegExp {
    let strMax = '';
    if (this.max > 0) {
      strMax = '' + this.max;
    }
    return new RegExp(`^${this.contentReg}{${this.min},${strMax}}$`);
  }

  public toString(): RegExp {
    return ;
  }

  public valid(): boolean {
    return this.warrent.valid();
  }

  public errText(): string[] {
    return ['WTF'];
  }

  public fill(o: any): void {
    return null;
  }

}

export default RegMinMaxWarrent;
