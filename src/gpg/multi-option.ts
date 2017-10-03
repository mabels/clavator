
export class MultiOption<T> {
  public values: T[];
  public options: T[] = [];
  public errText: string;

  public static fill<U>(js: any, dv: MultiOption<U>): void {
    dv.values = js['values'] || dv.values;
  }

  public constructor(v: T[], t: T[], e: string) {
    this.values = v;
    this.options = t;
    this.errText = e;
  }

  public map(cb: (selected: boolean, o: T) => any): any {
    return this.options.map((o) => cb(!!this.values.find((q: T) => q == o), o));
  }

  public valid(): boolean {
    return this.values.length == this.options.filter((q: T) => {
      return !!this.values.find((u: T) => u == q);
    }).length;
  }

}

export default MultiOption;
