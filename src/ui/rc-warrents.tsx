import * as React from 'react';
import { observer } from 'mobx-react';
import * as classnames from 'classnames';
import Warrent from '../gpg/warrent';
import Warrents from '../gpg/warrents';

interface RcWarrentsState {
  warrent: Warrent;
  done: boolean;
}

interface RcWarrentsProps extends React.Props<RcWarrents> {
  warrents: Warrents;
  completed: () => void;
}

@observer export class RcWarrents extends
  React.Component<RcWarrentsProps, RcWarrentsState> {

  constructor() {
    super();
    this.state = {
      warrent: new Warrent(),
      done: false
    };
  }

  private checkOrComplete(warrents: Warrents, warrent: Warrent): string {
    const text = warrent.valid() ? 'add' : '';
    if (warrents.length()) {
      return warrent.initial.value.length ? text : 'done';
    }
    return text;
  }

  private renderButton(): JSX.Element {
    const coc = this.checkOrComplete(this.props.warrents, this.state.warrent);
    console.log('renderButton:', coc);
    if (!coc.length) {
      return null;
    }
    return <button onClick={() => {
      switch (this.checkOrComplete(this.props.warrents, this.state.warrent)) {
        case 'add':
          this.props.warrents.add(this.state.warrent);
          this.setState({
            warrent: new Warrent()
          });
          break;
        default:
          this.setState({
            done: true
          });
          this.props.completed();
          break;
      }
    }}>{coc}</button>;
  }

  private renderInput(): JSX.Element {
    if (this.state.done) {
      return null ;
    }
    return <li key={'input'}>
      <input type="text"
        className={classnames({ good: this.state.warrent.valid() })}
        value={this.state.warrent.initial.value}
        onChange={(e: any) => {
          this.state.warrent.initial.value = e.target.value;
          this.setState(this.state);
        }}
      />{this.renderButton()}
    </li>;
  }

  public render(): JSX.Element {
    return (
      <div>
        Warrents-List
        <ul>
          {this.props.warrents.map(i => {
            return <li key={i.key}>{i.initial.value}</li>;
          }).concat([this.renderInput()])}
        </ul>
      </div>
    );
  }

}

export default RcWarrents;
