import * as React from 'react';
import { observer } from 'mobx-react';
import {
  InputPassPhrase,
  InputPassPhraseProps
} from '../controls/input-pass-phrase';
import { action } from 'mobx';
import { DoublePassword } from '../../model';
import { Button } from '@material-ui/core';

interface RandomInputPassPhraseProps extends InputPassPhraseProps {}

function randomize(props: RandomInputPassPhraseProps): void {
  console.log('randomize:', props.passPhrase.doublePasswords.length);
  props.passPhrase.doublePasswords.forEach(dp => dp.generateRandom());
}

interface LabelWithRandomProps extends RandomInputPassPhraseProps {
  label: string | JSX.Element;
}

const LabelWithRandom = observer((props: LabelWithRandomProps): JSX.Element => {
  return (
    <Button onClick={action(() => randomize(props))}>
      {props.label}
    </Button>
  );
});

export const RandomInputPassPhrase = observer((props: RandomInputPassPhraseProps) => {
  return (
    <InputPassPhrase
      label={<LabelWithRandom {...props} label={props.label} />}
      passPhrase={props.passPhrase}
      readOnly={props.readOnly}
    />
  );
});
