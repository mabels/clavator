
export function format_date(date: Date): string {
  return ""+date.getFullYear()+"-"
         +(100+date.getMonth()).toString().slice(1)+"-"
         +(100+date.getDate()).toString().slice(1);
}

function expireDate(): Date {
  let now = new Date();
  now.setFullYear(now.getFullYear() + 5);
  return now
}

export class Option<T> {
  public value: T;
  public options: T[] = [];
  public constructor(v: T, t: T[]) {
    this.value = v;
    this.options = t;
  }
  public map(cb: (selected: boolean, o: T) => any): any {
    return this.options.map((o) => cb(this.value == o, o));
  }
}

export class MultiOption<T> {
  public values: T[];
  public options: T[] = [];
  public constructor(v: T[], t: T[]) {
    this.values = v;
    this.options = t;
  }
  public map(cb: (selected: boolean, o: T) => any): any {
    return this.options.map((o) => cb(!!this.values.find((q) => q == o), o));
  }

}

export class KeyGen {
  keyType: Option<string> = new Option("RSA", ["RSA", "DSA"]);
  keyLength: Option<number> = new Option(8192, [2048, 4096, 8192, 16384]);
  keyUsage: MultiOption<string> = new MultiOption(['cert'], ['cert', 'unk1', 'unk3']);
  nameReal: string = "";
  nameEmail: string = "";
  nameComment: string = "";
  expireDate: Date = expireDate();

  command() {
    return [
      "Key-Type: " + this.keyType.value,
      "Key-Length: " + this.keyLength.value,
      "Key-Usage: " + this.keyUsage.values.join(","),
      "Name-Real: " + this.nameReal,
      "Name-Email: " + this.nameEmail,
      "Expire-Date: " + format_date(this.expireDate),
      "%commit",
      "%echo done"
    ].join("\n");
  }

}
