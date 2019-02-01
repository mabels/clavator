import * as React from 'react';
import { observer } from 'mobx-react';
import { IObservable, observable, IObservableValue, action } from 'mobx';
import classnames from 'classnames';
import { Warrents, Warrent } from '../../../model';
import { Button } from '@material-ui/core';
import { InputValid, InputTypeObservable, InputType } from './input-valid';

export interface RcWarrentsProps extends React.Props<RcWarrents> {
  readonly warrents: Warrents;
  readonly completed: () => void;
}

interface InputProps extends RcWarrentsProps {
  done: IObservableValue<boolean>;
}

function handlePressEnter(e: any, props: InputProps): void {
  console.log('handlePressEnter do validate', e.key);
  if (e.key === 'Enter') {
    console.log('do validate');
    addClick(props);
  }
}

function MyButton(props: InputProps): JSX.Element {
  const coc = checkOrComplete(props.warrents, props.warrents.last());
  console.log('MyButton:', coc);
  if (coc.length <= 1) {
    return null;
  }
  const clazz: any = {};
  clazz[coc] = true;
  return (
    <Button
      className={classnames(clazz)}
      onClick={action(() => addClick(props))}
    >
      {coc}
    </Button>
  );
}

function checkOrComplete(warrents: Warrents, warrent: Warrent): string {
  const text = warrents.valid ? 'add' : '';
  if (warrents.length > 1) {
    return warrent.warrent.value.length ? text : 'done';
  }
  return text;
}

function addClick(props: InputProps): void {
  switch (checkOrComplete(props.warrents, props.warrents.last())) {
    case 'add':
      props.warrents.add(new Warrent());
      break;
    case 'done':
      props.warrents.pop();
      props.done.set(true);
      props.completed();
      break;
  }
}

const InputWarrent = observer(
  (props: InputProps): JSX.Element => {
    if (props.done.get()) {
      return null;
    }
    // console.log('-2-', this.props.warrents.last().key);
    return (
      <li key={props.warrents.last().objectId()}>
        <InputValid
          label="Warrent"
          type={InputType.Text}
          activeValue={props.warrents.last().warrent._value}
          onKeyPress={action(e => handlePressEnter(e, props))}
        />
        <MyButton {...props} />
      </li>
    );
  }
);

@observer
export class RcWarrents extends React.Component<RcWarrentsProps, {}> {
  public readonly done: IObservableValue<boolean> = observable.box(false);

  public render(): JSX.Element {
    console.log('RC-Warrents:', this);
    return (
      <ol className="WarrentsList">
        {this.props.warrents.map((i, idx) => {
          if (idx == this.props.warrents.length - 1) {
            // console.log(`Input:Warrents:${idx}:${this.props.warrents.length}`);
            return (
              <InputWarrent
                key={i.objectId()}
                done={this.done}
                completed={this.props.completed}
                warrents={this.props.warrents}
              />
            );
          } else {
            // console.log(`Li:Warrents:${idx}:${this.props.warrents.length}`);
            return <li key={i.objectId()}>{i.warrent.value}</li>;
          }
        })}
      </ol>
    );
  }
}
