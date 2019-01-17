const DICERegex = /^[1-6]{1,}$/;

export class Diced {
  public readonly diced: number;
  public readonly password: string;

  public static parse(line: string): Diced {
    const cols = line.split(/\s+/);
    if (cols.length == 1 && cols[0].length == 0) {
      return null; // ignore empty lines
    }
    if (cols.length < 2) {
      throw `Diced: line not parsable:[${line}][${cols}:${cols.length}]`;
    }
    if (!DICERegex.test(cols[0])) {
      throw `Diced: illegal diced value:[${cols[0]}]`;
    }
    const part = cols.slice(1).join(' ');
    if (part.length < 1) {
      throw `Diced: needs password [${line}]`;
    }
    return new Diced(parseInt(cols[0], 10), part);
  }

  public static fill(obj: any): Diced {
    return new Diced(obj['diced'], obj['password']);
  }

  constructor(diced: number, password: string) {
    this.diced = diced;
    this.password = password;
  }

  public diceLength(): number {
    return ('' + this.diced).length;
  }

  public equals(other: Diced): boolean {
    return this.cmp(other) == 0;
  }

  public cmp(other: Diced): number {
    const diffDiced = other.diced - this.diced;
    if (diffDiced) {
      return diffDiced;
    }
    if (this.password < other.password) {
      return -1;
    } else if (this.password > other.password) {
      return 1;
    }
    return 0;
  }
}

export class DiceWare {
  public readonly fname: string;
  public readonly diceWare: Map<number, Diced>;
  public readonly diceCount: number;

  public static oneThrow(min = 1, max = 6): number {
    let random = 0;
    if (window && window.crypto && window.crypto.getRandomValues) {
      let array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      random = array[0] / 0x100000000;
    } else {
      random = Math.random();
    }
    // console.log('oneThrow:', random);
    return Math.floor(random * (max - min + 1)) + min;
  }

  public static fill(obj: any): DiceWare {
    // debugger;
    const fname = obj['fname'];
    const list = (obj['list'] || [])
      .map((i: any) => Diced.fill(i))
      .filter((d: Diced) => d);
    return new DiceWare(fname, list);
  }

  constructor(fname?: string, list?: Diced[]) {
    this.fname = fname;
    this.diceWare = new Map<number, Diced>();
    if (list && list.length > 0) {
      // console.log('DiceWare:', list);
      this.diceCount = list[0].diceLength();
      list.forEach(d => {
        if (d.diceLength() != this.diceCount) {
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

  public randomDice(): Diced {
    const diced = new Array(this.diceCount)
      .fill(0)
      .map(_ => DiceWare.oneThrow())
      .join('');
    // console.log('randomDice:', diced);
    return this.dice(diced);
  }

  public dice(nstr: string): Diced {
    return this.diceWare.get(~~nstr);
  }

  public dices(): number[] {
    return new Array(this.dicesCount()).fill(0).map((_, idx) => idx);
  }

  public dicesCount(): number {
    return this.diceCount;
  }

  public toObj(): any {
    return {
      fname: this.fname,
      list: Array.from(this.diceWare.values())
    };
  }
}
