
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
    return new Diced(obj['diced'], obj['password']);
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

  private oneThrow(): number {
    const min = 1;
    const max = 6;
    let random = 0;
    if (window && window.crypto && window.crypto.getRandomValues) {
      let array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      random = array[0] / 0x100000000;
    } else {
      random = Math.random();
    }
    // console.log('oneThrow:', random);
    return (Math.floor(random * (max - min + 1)) + min);
  }

  public randomDice(): Diced {
    const diced = (new Array(this.diceCount)).fill(0).map(_ => this.oneThrow()).join('');
    // console.log('randomDice:', diced);
    return this.dice(diced);
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
