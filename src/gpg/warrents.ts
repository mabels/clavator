// import Validatable from './validatable';
// import StringValue from './string-value';
import Container from './container';
import Warrent from './warrent';

export class Warrents extends Container<Warrent> {
  constructor() {
    super(() => { return new Warrent(); });
  }
}

export default Warrents;
