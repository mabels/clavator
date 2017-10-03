export function format_date(date: Date): string {
  return '' + date.getFullYear() + '-'
    + (100 + date.getMonth() + 1).toString().slice(1) + '-'
    + (100 + date.getDate()).toString().slice(1);
}

export function expireDate(): Date {
  let now = new Date();
  now.setFullYear(now.getFullYear() + 5);
  return now;
}

export function assignOnError(valid: boolean, ret: string[], errText: string | string[]): void {
  if (!valid) {
    if (typeof(errText) == 'string') {
      ret.push(errText);
    } else {
      Array.prototype.push.apply(ret, errText);
    }
  }
}
