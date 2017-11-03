import * as React from 'react';
import * as classnames from 'classnames';
import { observer } from 'mobx-react';
// import BooleanValue from '../../../model/boolean-value';
// import Container from '../../../model/container';
// import Uid from '../../../gpg/key-gen-uid';
import Option from '../../../model/option';

interface RcOptionState {
}

interface RcOptionProps<T> extends React.Props<RcOption<T>> {
  name: string;
  label: string;
  option: Option<T>;
  readonly: boolean;
}

@observer
export class RcOption<T> extends
  React.Component<RcOptionProps<T>, RcOptionState> {

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
        <select name={this.props.name}
          className={classnames({'u-full-width': true, readonly: this.props.readonly })}
          disabled={this.props.readonly}
          defaultValue={value}
          onChange={(e: any) => {
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