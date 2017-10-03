
export interface Validatable {
  valid(): boolean;
  errText(): string[];
  fill(js: any): void;
}

export default Validatable;
