
export class Diced {
  public readonly diced: number;
  public readonly password: string;

  public static parse(line: string): Diced {
    const cols = line.split(/\s+/);
    if (cols.length < 2) {
      return null;
    }
    const diced = parseInt(cols[0], 10);
    if (diced <= 0) {
      return null;
    }
    const part = cols.slice(1).join(' ');
    if (part.length <= 2) {
      return null;
    }
    return new Diced(diced, part);
  }

  public static fill(obj: any): Diced {
    return new Diced(obj['diced'], obj['part']);
  }

  constructor(diced: number, password: string) {
    this.diced = diced;
    this.password = password;
  }

}

export class DiceWare {
  public readonly fname: string;
  public readonly diceWare: Map<number, Diced>;
  public readonly diceCount: number;

  public static fill(obj: any): DiceWare {
    // debugger;
    const fname = obj['fname'];
    const list = (obj['list'] || []).map((i: any) => Diced.fill(i));
    return new DiceWare(fname, list);
  }

  constructor(fname?: string, list?: Diced[]) {
    this.fname = fname;
    this.diceWare = new Map<number, Diced>();
    if (list) {
      this.diceCount = ('' + list[0].diced).length;
      list.forEach(d => {
        if (d.diced.toString().length != this.diceCount) {
          throw 'dice count missmatch';
        }
        this.diceWare.set(d.diced, d);
      });
      if (list.length != this.diceWare.size) {
        throw 'dice map invalid';
      }
    } else {
      this.diceCount = 0;
    }
  }

  public dice(nstr: string): Diced {
    return this.diceWare.get(~~nstr);
  }

  public toObject(): any {
    return {
      fname: this.fname,
      list: Array.from(this.diceWare.values())
    };
  }

  public dices(): number[] {
    let nr = 0;
    return (new Array(this.dicesCount())).fill(0).map(i => nr++);
  }

  public dicesCount(): number {
    return this.diceCount;
  }

}

export default DiceWare;
