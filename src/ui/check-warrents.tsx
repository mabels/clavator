import * as React from 'react';
import SimpleYubiKey from '../gpg/simple-yubikey';

interface CheckWarrentsState {
}

interface CheckWarrentsProps extends React.Props<CheckWarrents> {
  simpleYubiKey: SimpleYubiKey;
}

export class CheckWarrents extends
  React.Component<CheckWarrentsProps, CheckWarrentsState> {

  constructor() {
    super();
    this.state = { status: 'not started' };
  }

  private renderWarrents(): JSX.Element {
    return <ul>
        {this.props.simpleYubiKey.warrents.pallets.map(i => <li>{i.initial.value}</li>)}
      </ul>;
  }

  public render(): JSX.Element {
    return (
      <div>
        CheckWarrents
        {this.props.children}
        {this.renderWarrents()}
      </div>
    );
  }

}

export default CheckWarrents;
