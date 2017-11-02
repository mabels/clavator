import * as React from 'react';
import * as classnames from 'classnames';
// import BooleanValue from '../../../model/boolean-value';
import KeyParams from '../../../gpg/key-params';
import RcOption from '../controls/rc-option';

interface RcKeyParamsState {
}

interface RcKeyParamsProps extends React.Props<RcKeyParams> {
  keyParams: KeyParams;
  readonly: boolean;
  completed: boolean;
}

export class RcKeyParams extends
  React.Component<RcKeyParamsProps, RcKeyParamsState> {

  constructor() {
    super();
    this.state = {};
  }

  public render(): JSX.Element {
    return (
      <div className={classnames({row: true, RcKeyParams: true, completed: this.props.completed })}>
        <div className="three columns">
          <RcOption name="KeyType" label="Key-Type"
            option={this.props.keyParams.type} readonly={this.props.readonly} />
        </div>
        <div className="three columns">
          <RcOption name="MasterKeyLength" label="Master-Key-Length"
             option={this.props.keyParams.masterLen} readonly={this.props.readonly} />
        </div>
        <div className="three columns">
          <RcOption name="SubKeyLength" label="Sub-Key-Length"
             option={this.props.keyParams.subLen} readonly={this.props.readonly} />
        </div>
      </div>
    );
  }

}

export default RcKeyParams;
