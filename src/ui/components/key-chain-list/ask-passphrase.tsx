
import * as React from 'react';
import { observer } from 'mobx-react';
import { observable, IObservableValue, computed, action } from 'mobx';
import { TextField, FormControl, InputLabel, Input, Button } from '@material-ui/core';
import { InputPassword } from '../controls/input-password';
import { DoublePassword } from '../../model';

interface AskPassphraseProps extends React.Props<AskPassphrase> {
  readonly passphrase?: IObservableValue<string>;
  readonly fingerprint: string;
  readonly completed?: (pp: string) => void;
}

@observer
export class AskPassphrase
  extends React.Component<AskPassphraseProps, {}> {

  public readonly value: IObservableValue<string>;

  public constructor(props: AskPassphraseProps) {
    super(props);
    this.value = props.passphrase || observable.box('');
  }

  public render(): JSX.Element {
          // <form noValidate autoComplete="off"
      //   onSubmit={(e) => e.preventDefault()}
      //   className="AskPassphrase"
      //   key={this.props.fingerprint}>
    return (
      <div key={this.props.fingerprint}>
        <InputPassword label="Passphrase" value={this.value} />
        <Button onClick={action((e: any) => {
          if (this.props.completed) {
            this.props.completed(this.value.get());
          }
        })}>Ready</Button>
      </div>
    );
  }
}
