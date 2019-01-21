
import * as React from 'react';
import { observer } from 'mobx-react';
import { observable, IObservableValue, computed, action } from 'mobx';

import { MutableString } from '../../../model';

interface AskPassphraseProps extends React.Props<AskPassphrase> {
  passphrase?: MutableString;
  fingerprint: string;
  completed: (pp: string) => void;
}

@observer
export class AskPassphrase
  extends React.Component<AskPassphraseProps, {}> {

  public _value: IObservableValue<string> = observable.box(undefined);

  constructor(props: AskPassphraseProps) {
    super(props);
  }

  @computed
  public get value(): string {
    return this._value.get();
  }

  public render(): JSX.Element {
    return (
      <form
        onSubmit={(e) => e.preventDefault()}
        className="AskPassphrase" key={this.props.fingerprint}>
        <label>Passphrase:</label><input type="password"
          name={`ap-${this.props.key}`}
          onChange={action((e: any) => {
            if (this.value) {
              this._value.set(e.target.value);
            } else {
              this.props.passphrase._value.set(e.target.value);
            }
          })} />
        <button type="button" onClick={(e: any) => {
          if (this.props.completed) {
            this.props.completed(this.value || this.props.passphrase.value);
          }
        }}>Ready</button>
      </form>
    );
  }
}
