import * as React from 'react';
import { observer } from 'mobx-react';
import { InputPassPhrase, InputPassPhraseProps } from '../controls/input-pass-phrase';

class RandomInputPassPhraseState {
}

interface RandomInputPassPhraseProps extends InputPassPhraseProps {
}

@observer
export class RandomInputPassPhrase extends
  React.Component<RandomInputPassPhraseProps, RandomInputPassPhraseState> {

  // private inputRandoms: JSX.Element[];

  constructor(props: RandomInputPassPhraseProps) {
    super(props);
    this.state = { /* readOnly: null */ };
    this.randomize = this.randomize.bind(this);
  }

  private randomize(e: any): void {
    // console.log('diceAll');
    this.props.passPhrase.doublePasswords.forEach(dp => dp.generateRandom());
  }

  private labelWithRandom(label: string | JSX.Element): string | JSX.Element {
    return <span>{label}<button
      className="fa fa-random"
      onClick={this.randomize}
      ></button></span>;
  }

  public render(): JSX.Element {
    return <InputPassPhrase
            label={this.labelWithRandom(this.props.label)}
            passPhrase={this.props.passPhrase}
            readOnly={this.props.readOnly} />;
  }

}
