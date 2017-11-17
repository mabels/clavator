
class Range {
  public readonly from: string;
  public readonly to: string;

  constructor(from?: string, to?: string) {
    if ((!from && to) || (from && !to)) {
      throw 'from xor to has to be defined';
    }
    this.from = from;
    this.to = to;
    if (!from && !to) {
      return;
    }
    if (from.length != 1 || to.length != 1) {
      throw 'from has to be a single char';
    }
    if (to.charCodeAt(0) < from.charCodeAt(0)) {
      throw 'from code has to be smaller than to';
    }
  }

  public isWildCard(): boolean {
    return !this.from && !this.to;
  }

  public dist(): number {
    const r = this.toCode() - this.fromCode();
    return r > 0 ? r + 1 : 0;
  }

  public fromCode(): number {
    return this.from.charCodeAt(0);
  }

  public toCode(): number {
    return this.to.charCodeAt(0);
  }

}

export default class CharFormat {
  private readonly ranges: Range[];

  public static decNumber(): CharFormat {
    return (new CharFormat()).range('0', '9');
  }

  public static diceNumber(): CharFormat {
    return (new CharFormat()).range('1', '6');
  }

  public static wildcard(): CharFormat {
    return (new CharFormat()).any();
  }

  public static lowerAlphas(): CharFormat {
    return (new CharFormat()).range('a', 'z');
  }

  public static password(): CharFormat {
    return (new CharFormat()).range('0', '1').range('a', 'z').range('A', 'Z').range('!', '/');
  }

  constructor() {
    this.ranges = [];
  }

  public range(from: string, to: string): CharFormat {
    this.ranges.push(new Range(from, to));
    return this;
  }

  public any(): CharFormat {
    this.ranges.push(new Range());
    return this;
  }

  public vector(): String[] {
    if (this.isWildCard()) {
      throw 'vector to wildcard is not allowed';
    }
    // console.log(this.ranges);
    const reducedRanges = this.ranges.sort((a, b) => a.fromCode() - b.fromCode())
      .reduce((prev, curr) => {
      if (!prev.length) {
        prev.push(curr);
        return prev;
      }
      const last = prev[0];
      if (last.fromCode() <= curr.fromCode() && curr.fromCode() <= last.toCode()) {
        // from is including
        if (!(last.fromCode() <= curr.toCode() && curr.toCode() <= last.toCode())) {
          // to is excluding from from
          last.to = curr.to;
        }
      } else {
        prev.push(curr);
      }
      // console.log(prev);
      return prev;
    }, []).map(r => (new Array(r.dist()))
      .fill(r.fromCode())
      .map((c, i) => String.fromCharCode(c + i)));
    // console.log(reducedRanges);
    return [].concat.apply([], reducedRanges);
  }

  public isWildCard(): boolean {
    return !!this.ranges.find(i => i.isWildCard());
  }

  public dist(): number {
    if (this.isWildCard()) {
      return 0;
    }
    return this.ranges.map(r => r.dist()).reduce((prev, curr) => prev + curr);
  }

  public asRegExpString(): String {
    if (this.isWildCard()) {
      return '.';
    }
    return `[${this.ranges.map(r => `${r.from}-${r.to}`).join('')}]`;
  }
}
