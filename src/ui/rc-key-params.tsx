import * as React from 'react';
import KeyParams from '../gpg/key-params';
import RcOption from './rc-option';

interface RcKeyParamsState {
}

interface RcKeyParamsProps extends React.Props<RcKeyParams> {
  keyParams: KeyParams;
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
          <RcOption label="Key-Type" option={this.props.keyParams.type} />
        </div>
        <div className="three columns">
          <RcOption label="Master-Key-Length" option={this.props.keyParams.masterLen} />
        </div>
        <div className="three columns">
          <RcOption label="Sub-Key-Length" option={this.props.keyParams.subLen} />
        </div>
      </div>
    );
  }

}

export default RcKeyParams;
