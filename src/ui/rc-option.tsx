import * as React from 'react';
import Container from '../gpg/container';
import Uid from '../gpg/key-gen-uid';
import Option from '../gpg/option';

interface RcOptionState<T> {
}

interface RcOptionProps<T> extends React.Props<RcOption<T>> {
  label: string;
  option: Option<T>;
}

export class RcOption<T> extends
  React.Component<RcOptionProps<T>, RcOptionState<T>> {

  constructor() {
    super();
    this.state = {};
  }

  public render(): JSX.Element {
    let value = '';
    let ret = this.props.option.map((s, o) => {
      value = s ? o.toString() : value;
      return (<option key={o.toString()} value={o.toString()}>{o}</option>);
    });
    return (
      <span>
        <label>{this.props.label}:</label>
        <select className="u-full-width" name={name} defaultValue={value} onChange={(e: any) => {
          this.props.option.options.forEach((op) => {
            let murks = op as any;
            if (murks['value']) {
              murks['value'] = e.target.value;
            } else {
              murks = e.target.value;
            }
          });
          this.setState(this.state);
        }}>
          {ret}
        </select>
      </span>
    );
  }

}

export default RcOption;