import * as React from 'react';
import classnames from 'classnames';
import NestedFlag from '../../../model/nested-flag';
import KeyParams from '../../../gpg/key-params';
import RcOption from '../controls/rc-option';

interface RcKeyParamsState {
}

interface RcKeyParamsProps extends React.Props<RcKeyParams> {
  keyParams: KeyParams;
  readOnly: NestedFlag;
  completed: boolean;
}

export class RcKeyParams extends
  React.Component<RcKeyParamsProps, RcKeyParamsState> {

  constructor(props: RcKeyParamsProps) {
    super(props);
    this.state = {};
  }

  public render(): JSX.Element {
    return (
      <div className={classnames({row: true, RcKeyParams: true, completed: this.props.completed })}>
        <div className="three columns">
          <RcOption name="KeyType" label="Key-Type"
            option={this.props.keyParams.type} readOnly={this.props.readOnly} />
        </div>
        <div className="three columns">
          <RcOption name="MasterKeyLength" label="Master-Key-Length"
             option={this.props.keyParams.masterLen} readOnly={this.props.readOnly} />
        </div>
        <div className="three columns">
          <RcOption name="SubKeyLength" label="Sub-Key-Length"
             option={this.props.keyParams.subLen} readOnly={this.props.readOnly} />
        </div>
      </div>
    );
  }

}

export default RcKeyParams;
