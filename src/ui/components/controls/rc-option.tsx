import * as React from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import NestedFlag from '../../../model/nested-flag';
// import Container from '../../../model/container';
// import Uid from '../../../gpg/key-gen-uid';
import Option from '../../../model/option';

interface RcOptionState {
}

interface RcOptionProps<T> extends React.Props<RcOption<T>> {
  name: string;
  label: string;
  option: Option<T>;
  readOnly: NestedFlag;
  onChange?: (val: T) => void;
}

@observer
export class RcOption<T> extends
  React.Component<RcOptionProps<T>, RcOptionState> {

  constructor(props: RcOptionProps<T>) {
    super(props);
  }

  public render(): JSX.Element {
    let value = '';
    const ret = this.props.option.map((s, o) => {
      value = s ? o.toString() : value;
      return (<option key={o.toString()} disabled={this.props.readOnly.is} value={o.toString()}>{o}</option>);
    });
    return (
      <span>
        <label>{this.props.label}:</label>
        <select name={this.props.name}
          className={classnames({ 'u-full-width': true, readonly: this.props.readOnly.is })}
          disabled={this.props.readOnly.is}
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
            if (this.props.onChange) {
              this.props.onChange(e.target.value);
            }
          }}>
          {ret}
        </select>
      </span>
    );
  }

}

export default RcOption;
