
import { IObjectId } from './object-id';

export interface Validatable extends IObjectId {
  valid(): boolean;
  errText(): string[];
  fill(js: any): void;
}

export default Validatable;
