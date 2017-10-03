import * as React from 'react';
import SimpleYubiKey from '../gpg/simple-yubikey';
import CheckWarrents from './check-warrents';

interface RcPassPhraseState {
}

interface RcPassPhraseProps extends React.Props<RcPassPhrase> {
  title: string;
  simpleYubiKey: SimpleYubiKey;
}

export class RcPassPhrase extends
  React.Component<RcPassPhraseProps, RcPassPhraseState> {

  constructor() {
    super();
    this.state = { };
  }

  public render(): JSX.Element {
    return (
      <div>
        <CheckWarrents simpleYubiKey={this.props.simpleYubiKey}>
          RcPassPhrase {this.props.title}
        </CheckWarrents>
      </div>
    );
  }

}

export default RcPassPhrase;
