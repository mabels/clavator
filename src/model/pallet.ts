import Validatable from './validatable';

export interface Pallet extends Validatable {
  toObj(): any;
}

export default Pallet;
