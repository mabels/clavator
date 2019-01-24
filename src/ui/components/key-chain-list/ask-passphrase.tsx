
import * as React from 'react';
import { observer } from 'mobx-react';
import { observable, IObservableValue, computed, action } from 'mobx';

interface AskPassphraseProps extends React.Props<AskPassphrase> {
  readonly passphrase?: IObservableValue<string>;
  readonly fingerprint: string;
  readonly completed: (pp: string) => void;
}

@observer
export class AskPassphrase
  extends React.Component<AskPassphraseProps, {}> {

  public readonly _value: IObservableValue<string> = observable.box(undefined);

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
              this.props.passphrase.set(e.target.value);
            }
          })} />
        <button type="button" onClick={action((e: any) => {
          console.log('Button-AskPassphrase:', this.props.completed, this.value, this.props.passphrase.get());
          if (this.props.completed) {
            this.props.completed(this.value || this.props.passphrase.get());
          }
        })}>Ready</button>
      </form>
    );
  }
}
