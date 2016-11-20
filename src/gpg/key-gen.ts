
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
  public errText: string;
  public constructor(v: T, t: T[], e: string) {
    this.value = v;
    this.options = t;
    this.errText = e;
  }
  public static fill<U>(js: any, dv: Option<  U>) {
    dv.value = js['value'] || dv.value
  }

  public map(cb: (selected: boolean, o: T) => any): any {
    return this.options.map((o) => cb(this.value == o, o));
  }
  public valid() : boolean {
    return !!this.options.find((i:T) => i == this.value)
  }
}

export class MultiOption<T> {
  public values: T[];
  public options: T[] = [];
  public errText: string;
  public constructor(v: T[], t: T[], e: string) {
    this.values = v;
    this.options = t;
    this.errText = e;
  }
  public static fill<U>(js: any, dv: MultiOption<U>) {
    dv.values = js['values'] || dv.values
  }
  public map(cb: (selected: boolean, o: T) => any): any {
    return this.options.map((o) => cb(!!this.values.find((q:T) => q == o), o));
  }

  public valid() : boolean {
    return this.values.length == this.options.filter((q:T) => {
      return !!this.values.find((u:T) => u == q)
    }).length;
  }

}

export class PwPair {
  match : RegExp;
  password: string = "";
  verify: string = "";
  errText: string;
  public constructor(match: RegExp, e: string) {
    this.match = match
    this.errText = e;
  }
  public static fill(js: any, dv: PwPair) {
    dv.password = js['password'] || dv.password
    dv.verify = js['verify'] || dv.verify
  }
  public valid_password() {
    return this.match.test(this.password)
  }
  public valid_verify() {
    return this.match.test(this.verify)
  }

  public valid() : boolean {
    return this.password == this.verify && this.match.test(this.password)
  }
}

const EmailRegExp = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i

export class StringValue {
  match: RegExp;
  value: string = "";
  errText: string;
  public constructor(match: RegExp, e: string) {
    this.match = match;
    this.errText = e;
  }
  public static fill(js: any, dv: StringValue) {
    dv.value = js['value'] || dv.value
  }
  public valid() : boolean {
    return this.match.test(this.value)
  }
}

export class DateValue {
  value: Date
  errText: string
  public constructor(v: Date, e: string) {
    this.value = v;
    this.errText = e;
  }

  public static fill(js: any, dv: DateValue) {
    dv.value = (new Date(js['value'])) || dv.value
  }

  public valid() : boolean {
    let tomorrow = new Date(Date.now());
    tomorrow.setHours(tomorrow.getHours() + 24);
    return this.value.getTime() > tomorrow.getTime()
  }
}

export class KeyGen {
  password: PwPair = new PwPair(/^.{14,1024}$/, "Password Error");
  adminPin: PwPair = new PwPair(/^[0-9]{8}$/, "adminPin Error");
  userPin: PwPair = new PwPair(/^[0-9]{6,8}$/, "userPin Error");
  keyType: Option<string> = new Option("RSA", ["RSA", "DSA"], "keyType Error");
  masterKeyLength: Option<number> = new Option(8192, [2048, 4096, 8192, 16384], "master keyLength Error");
  subKeyLength: Option<number> = new Option(4096, [2048, 4096, 8192, 16384], "sub keyLength Error");
  keyUsage: MultiOption<string> = new MultiOption(['cert'], ['cert', 'enc', 'unk3'], "keyUsage Error");
  nameReal: StringValue = new StringValue(/^([A-Z][a-z]*\s*)+$/, "nameReal error");
  nameEmail: StringValue = new StringValue(EmailRegExp, "nameEmail error");
  nameComment: StringValue = new StringValue(/.*/, "nameComment error");
  expireDate: DateValue = new DateValue(expireDate(), "expireDate error");

  public static fill(js: any, kg: KeyGen) {
    PwPair.fill(js['password']||{}, kg.password);
    PwPair.fill(js['adminPin']||{}, kg.adminPin);
    PwPair.fill(js['userPin']||{}, kg.userPin);
    Option.fill(js['keyType']||{}, kg.keyType);
    Option.fill(js['masterKeyLength']||{}, kg.masterKeyLength);
    Option.fill(js['subKeyLength']||{}, kg.subKeyLength);
    MultiOption.fill(js['keyUsage']||{}, kg.keyUsage);
    StringValue.fill(js['nameReal']||{}, kg.nameReal);
    StringValue.fill(js['nameEmail']||{}, kg.nameEmail);
    StringValue.fill(js['nameComment']||{}, kg.nameComment);
    DateValue.fill(js['expireDate']||{}, kg.expireDate);
  }

  errText() : string[] {
    let ret: string[] = [];
    !this.password.valid() && ret.push(this.password.errText);
    !this.adminPin.valid() && ret.push(this.adminPin.errText);
    !this.userPin.valid() && ret.push(this.userPin.errText);
    !this.keyType.valid() && ret.push(this.keyType.errText);
    !this.subKeyLength.valid() && ret.push(this.subKeyLength.errText);
    !this.masterKeyLength.valid() && ret.push(this.masterKeyLength.errText);
    !this.keyUsage.valid() && ret.push(this.keyUsage.errText);
    !this.nameReal.valid() && ret.push(this.nameReal.errText);
    !this.nameEmail.valid() && ret.push(this.nameEmail.errText);
    !this.nameComment.valid() && ret.push(this.nameComment.errText);
    !this.expireDate.valid() && ret.push(this.expireDate.errText);
    return ret;
  }

  valid() {
    console.log(this.errText());
    return this.password.valid() &&
       this.adminPin.valid() && this.userPin.valid() &&
       this.keyType.valid() && this.subKeyLength.valid() &&
       this.masterKeyLength.valid() &&
       this.keyUsage.valid() && this.nameReal.valid() &&
       this.nameEmail.valid() && this.nameComment.valid() &&
       this.expireDate.valid();
  }

  masterCommand() {
    return [
      "Key-Type: " + this.keyType.value,
      "Key-Length: " + this.masterKeyLength.value,
      "Key-Usage: " + this.keyUsage.values.join(","),
      "Name-Real: " + this.nameReal,
      "Name-Email: " + this.nameEmail,
      "Expire-Date: " + format_date(this.expireDate.value),
      "%commit",
      "%echo done"
    ].join("\n");
  }


}
