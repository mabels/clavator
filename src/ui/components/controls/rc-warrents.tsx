import * as React from 'react';
import { observer, propTypes } from 'mobx-react';
import classnames from 'classnames';
import {
  Warrents,
  Warrent } from '../../../model';
import { observable } from 'mobx';

export interface RcWarrentsProps extends React.Props<RcWarrents> {
  warrents: Warrents;
  completed: () => void;
}

interface InputProps extends RcWarrentsProps {
  done: boolean;
}

function handlePressEnter(e: any, props: InputProps): void {
  if (e.key === 'Enter') {
    console.log('do validate');
    addClick(props);
  }
}

function Button(props: InputProps): JSX.Element {
  const coc = checkOrComplete(props.warrents, props.warrents.last());
  if (coc.length <= 1) {
    return null;
  }
  const clazz: any = { };
  clazz[coc] = true;
  return <button className={classnames(clazz)}
    onClick={() => addClick(props)}>{coc}</button>;
}

function checkOrComplete(warrents: Warrents, warrent: Warrent): string {
  const text = warrents.valid() ? 'add' : '';
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
      props.done = true;
      props.completed();
      break;
  }
}

function Input(props: InputProps): JSX.Element {
  if (props.done) {
    return null ;
  }
  // console.log('-2-', this.props.warrents.last().key);
  return <li key={props.warrents.last().objectId()}>
    <input type="text"
      autoFocus
      className={classnames({
         good: props.warrents.valid()
      })}
      value={props.warrents.last().warrent.value}
      onKeyPress={(e) => handlePressEnter(e, props)}
      onChange={(e: any) => {
        props.warrents.last().warrent.value = e.target.value;
      }}
    /><Button {...props} />
  </li>;
}

@observer export class RcWarrents extends
  React.Component<RcWarrentsProps, {}> {

  @observable
  public done: boolean;

  public render(): JSX.Element {
    console.log('RC-Warrents:', this);
    return (
        <ol className="WarrentsList">
          {this.props.warrents.map((i, idx) => {
            if (idx == this.props.warrents.length - 1) {
              // console.log(`Input:Warrents:${idx}:${this.props.warrents.length}`);
              return <Input
                done={this.done}
                completed={this.props.completed}
                warrents={this.props.warrents} />;
            } else {
              // console.log(`Li:Warrents:${idx}:${this.props.warrents.length}`);
              return <li key={i.objectId()}>{i.warrent.value}</li>;
            }
          })}
        </ol>
    );
  }

}
