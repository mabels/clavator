
export default class MinMax {
  public min: number;
  public max: number;
  public readonly contReg: string;
  public regExp: RegExp;

  public static create(parts: number, contReg: string, minLen: number, maxLen: number): MinMax[] {
    const minMaxs = (new Array(parts)).fill(42).map(_ => new MinMax(contReg));
    for (let min = 0; parts && min < minLen; ++min) {
      minMaxs[min % parts].min++;
    }
    for (let max = 0; parts && maxLen && max < maxLen; ++max) {
      minMaxs[max % parts].max++;
    }
    // console.log(`${parts}:${minLen}:${maxLen}${JSON.stringify(minMaxs)}`);
    minMaxs.forEach(m => m.freeze());
    return minMaxs;
  }

  constructor(contReg: string) {
    this.contReg = contReg;
    this.max = 0;
    this.min = 0;
  }
  public freeze(): void {
    this.regExp = new RegExp(`^${this.contReg}{${this.min},${this.max ? this.max : ''}}$`);
  }
}