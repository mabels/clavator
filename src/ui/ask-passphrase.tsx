
import * as React from 'react';

import MutableString from '../gpg/mutable_string';

interface AskPassphraseState {
  value: string
}

interface AskPassphraseProps extends React.Props<AskPassphrase> {
  passphrase?: MutableString,
  fingerprint: string,
  completed: (pp: string) => void;
}

export class AskPassphrase
  extends React.Component<AskPassphraseProps, AskPassphraseState>
{
  constructor() {
    super();
    this.state = {
      value: null
    };
  }

  public render(): JSX.Element {
    return (
      <form className="AskPassphrase" key={this.props.fingerprint}>
        <label>Passphrase:</label><input type="password"
          name={`ap-${this.props.key}`} required={true}
          onChange={(e: any) => {
            if (this.state.value) {
              this.setState({ value : e.target.value });
            } else {
              this.props.passphrase.value = e.target.value;
            }
          }} />
        <button type="button" onClick={(e: any) => {
          this.props.completed && this.props.completed(this.state.value || this.props.passphrase.value)
        }}>Ready</button>
      </form>
    );
  }
}
