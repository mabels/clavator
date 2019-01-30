import * as React from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import {
  NestedFlag,
} from '../../../model';
import {
  PassPhrase,
  DoublePassword,
  ViewWarrents
} from '../../model';
import { RcDoublePassword } from './rc-double-password';

export interface InputPassPhraseProps {
  label: string | JSX.Element;
  passPhrase: PassPhrase;
  elementsPerRow?: number;
  readOnly: NestedFlag;
  approvedWarrents?: ViewWarrents;
  childFactory?: (dp: DoublePassword, idx: number) => JSX.Element;
  // onReadable?: (readable: boolean) => void;
}

export const InputPassPhrase = observer((props: InputPassPhraseProps) => {
    const rows: DoublePassword[][] = [];
    const elements = props.elementsPerRow || 3;
    props.passPhrase.doublePasswords.forEach((dp, idx) => {
      let row = rows[~~(idx / elements)];
      if (!row) {
        row = [];
        rows.push(row);
      }
      row.push(dp);
    });
    // console.log('input-pass-phrase:', props.readOnly);
    return (
      <div
        key={`InputPassPhrase.${props.passPhrase.objectId()}`}
        className={classnames({
          InputPassPhrase: true,
          completed: props.passPhrase.completed,
          readonly:
            props.passPhrase.readOnly.value ||
            (props.approvedWarrents && props.approvedWarrents.non())
        })}
      >
        <div className="row">
          <label>{props.label}:</label>
        </div>
        {rows.map((row, ridx) => (
          <div
            key={`${props.passPhrase.objectId()}.${ridx}`}
            className="row"
          >
            {row.map((dp, pidx) => {
              const idx = ridx * elements + pidx;
              // console.log('input-pass-phrase:render:', idx);
              return (
                <RcDoublePassword
                  onReadable={(r: boolean) =>
                    console.log(
                      'input-pass-phrase:onReadable:',
                      dp.objectId(),
                      r
                    )
                  }
                  readOnly={props.readOnly}
                  key={`${props.passPhrase.objectId()}.${idx}`}
                  doublePassword={dp}
                  idx={
                    props.passPhrase.doublePasswords.length > 1
                      ? idx
                      : null
                  }
                >
                  {props.childFactory && props.childFactory(dp, idx)}
                </RcDoublePassword>
              );
            })}
          </div>
        ))}
      </div>
    );
  });
