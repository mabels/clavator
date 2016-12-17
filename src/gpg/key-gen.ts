
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
    console.log(">>>>Option>>>", js)
    dv.value = js['value'] || dv.value
    console.log("<<<<<<Option<<<<", dv)
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

export class ValidatableString {
  match : RegExp;
  value: string = "";
  errText: string;
  public constructor(match: RegExp, e: string) {
    this.match = match;
    this.errText = e;
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

interface Validatable {
  valid() : boolean;
  errText() : string[];
  fill(js: any) : void;
}
export class KeyInfo implements Validatable {
  type: Option<string>
  length: Option<number>
  usage: MultiOption<string>
  public constructor(type = "RSA", length = 4096, usage = ['sign','encr','auth']) {
    this.type = new Option(type, ["RSA", "DSA"], "keyType Error");
    this.length = new Option(length, [1024, 2048, 4096, 8192], "sub keyLength Error");
    this.usage = new MultiOption(usage, ['cert', 'sign', 'encr', 'auth'], "keyUsage Error");
  }
  public fill(js: any) {
    Option.fill(js['type']||{}, this.type);
    Option.fill(js['length']||{}, this.length);
    MultiOption.fill(js['usage']||{}, this.usage);
    // console.log("<<<<", ki)
    // return ki;
  }

  public valid() : boolean {
    return this.type.valid() && this.length.valid() &&
    this.usage.valid()
  }

  public errText() : string[] {
    let ret : string[] = [];
    !this.type.valid() && ret.push(this.type.errText);
    !this.length.valid() && ret.push(this.length.errText);
    !this.usage.valid() && ret.push(this.usage.errText);
    return ret;
  }
}

// export class SubKeys {
//   subKeys: KeyInfo[] = [];
//   public errText() : string[] {
//     let ret : string[] = [];
//     for (let sk of this.subKeys) {
//       !sk.valid() && Array.prototype.push.apply(ret, sk.errText());
//     }
//     return ret;
//   }
//   public add(ki: KeyInfo) {
//     this.subKeys.push(ki);
//   }
//   public valid() {
//     let ret = true;
//     for (let sk of this.subKeys) {
//       ret = ret && sk.valid();
//     }
//     return ret;
//   }
//   public static fill(js: any, sb: SubKeys) : SubKeys {
//     sb.subKeys = [];
//     for(let ki of js['subKeys']) {
//         sb.add(KeyInfo.fill(ki, new KeyInfo()));
//     }
//     return sb;
//   }
// }


export class Uid implements Validatable {
  name: StringValue = new StringValue(/^([A-Z][a-z]*\s*)+$/, "name error");
  email: StringValue = new StringValue(EmailRegExp, "email error");
  comment: StringValue = new StringValue(/.*/, "comment error");

  public fill(js: any) {
    StringValue.fill(js['name']||{}, this.name);
    StringValue.fill(js['email']||{}, this.email);
    StringValue.fill(js['comment']||{}, this.comment);
  }

  public valid() : boolean {
    return this.name.valid() && this.email.valid() &&
           this.comment.valid()
  }

  public errText() : string[] {
    let ret : string[] = [];
    !this.name.valid() && ret.push(this.name.errText);
    !this.email.valid() && ret.push(this.email.errText);
    !this.comment.valid() && ret.push(this.comment.errText);
    return ret;
  }

  public toString() : string {
    let name = this.name.value.trim();
    let email = this.email.value.trim();
    let comment = this.comment.value.trim();
    let tmp = name+" ("+comment+") <"+email+">";
    if (comment == "") {
      tmp = name+" <"+email+">";
    }
    return tmp;
  }
}

export class Container<T extends Validatable> {
  pallets: T[] = [];
  factory: () => T;
  constructor(factory: () => T) {
    this.factory = factory;
  }
  public errText() : string[] {
    let ret : string[] = [];
    for (let i of this.pallets) {
      if (i) {
        !i.valid() && Array.prototype.push.apply(ret, i.errText());
      }
    }
    return ret;
  }
  public add(i: T) {
    this.pallets.push(i);
  }
  public valid() {
    let ret = true;
    for (let sk of this.pallets) {
      if (sk) {
        ret = ret && sk.valid();
      }
    }
    return ret;
  }
  public fill(js: any) {
    this.pallets = [];
    for(let i of js['pallets']) {
      if (i) {
        let t : T = this.factory();
        t.fill(i);
        this.add(t);
      }
    }
  }
}
export class KeyGen {
  password: PwPair = new PwPair(/^.{14,1024}$/, "Password Error");
  // adminPin: PwPair = new PwPair(/^[0-9]{8}$/, "adminPin Error");
  // userPin: PwPair = new PwPair(/^[0-9]{6,8}$/, "userPin Error");
  keyInfo: KeyInfo = new KeyInfo("RSA", 4096, ['cert']);
  expireDate: DateValue = new DateValue(expireDate(), "expireDate error");
  uids : Container<Uid> = new Container<Uid>(()=>{return new Uid()});
  subKeys: Container<KeyInfo> = new Container<KeyInfo>(()=>{return new KeyInfo()});

  public static withSubKeys(cnt: number) : KeyGen {
    let ret = new KeyGen();
    for (let i = 0; i < cnt; ++i) {
      ret.subKeys.add(new KeyInfo());
    }
    return ret;
  }
  public static fill(js: any, kg: KeyGen) {
    PwPair.fill(js['password']||{}, kg.password);
    // PwPair.fill(js['adminPin']||{}, kg.adminPin);
    // PwPair.fill(js['userPin']||{}, kg.userPin);
    kg.keyInfo.fill(js['keyInfo']);
    kg.uids.fill(js['uids'])
    // StringValue.fill(js['nameReal']||{}, kg.nameReal);
    // StringValue.fill(js['nameEmail']||{}, kg.nameEmail);
    // StringValue.fill(js['nameComment']||{}, kg.nameComment);
    DateValue.fill(js['expireDate']||{}, kg.expireDate);
    kg.subKeys.fill(js['subKeys'])
    // SubKeys.fill(js['subKeys']||[], kg.subKeys);
  }

  errText() : string[] {
    let ret: string[] = [];
    !this.password.valid() && ret.push(this.password.errText);
    // !this.adminPin.valid() && ret.push(this.adminPin.errText);
    // !this.userPin.valid() && ret.push(this.userPin.errText);
    !this.keyInfo.valid() && Array.prototype.push.apply(ret, this.keyInfo.errText());
    !this.subKeys.valid() && Array.prototype.push.apply(ret, this.subKeys.errText());
    !this.uids.valid() && Array.prototype.push.apply(ret, this.uids.errText());
    !this.expireDate.valid() && ret.push(this.expireDate.errText);
    return ret;
  }

  valid() {
    // console.log(this.errText());
    let ret = this.password.valid() &&
      //  this.adminPin.valid() && this.userPin.valid() &&
       this.keyInfo.valid() &&
       this.uids.valid() &&
       this.subKeys.valid() &&
       this.expireDate.valid();
    // if (!ret) {
    //   console.log("keygen:", this.errText());
    // }
    return ret;
  }

  masterCommand() {
    let ret = [
      "Key-Type: " + this.keyInfo.type.value,
      "Key-Length: " + this.keyInfo.length.value,
      "Key-Usage: " + this.keyInfo.usage.values,
      "Name-Real: " + this.uids.pallets[0].name.value,
      "Name-Email: " + this.uids.pallets[0].email.value,
    ]
    if (this.uids.pallets[0].comment.value.length > 0) {
      ret.push("Name-Comment: " + this.uids.pallets[0].comment.value)
    }
    ret.push("Expire-Date: " + format_date(this.expireDate.value))
    ret.push("%commit")
    ret.push("%echo done")
    return ret.join("\n");
  }


}
