import * as React from 'react';
import BooleanValue from '../gpg/boolean-value';
import KeyParams from '../gpg/key-params';
import RcOption from './rc-option';

interface RcKeyParamsState {
}

interface RcKeyParamsProps extends React.Props<RcKeyParams> {
  keyParams: KeyParams;
  readonly: BooleanValue;
}

export class RcKeyParams extends
  React.Component<RcKeyParamsProps, RcKeyParamsState> {

  constructor() {
    super();
    this.state = {};
  }

  public render(): JSX.Element {
    return (
      <div className="row">
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
