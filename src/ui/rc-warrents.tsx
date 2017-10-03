import * as React from 'react';
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

export class RcWarrents extends
  React.Component<RcWarrentsProps, RcWarrentsState> {

  constructor() {
    super();
    this.state = {
      warrent: new Warrent(),
      done: false
    };
  }

  public componentWillMount(): void {
    /* */
  }

  private checkOrComplete(warrents: Warrents, warrent: Warrent): string {
    if (warrents.pallets.length) {
      return warrent.initial.value.length ? 'add' : 'done';
    }
    return 'add';
  }

  private renderInput(): JSX.Element {
    if (this.state.done) {
      return null;
    }
    return <li key={'input'}>
      <input type="text"
        value={this.state.warrent.initial.value}
        onChange={(e: any) => {
          this.state.warrent.initial.value = e.target.value;
          this.setState(this.state);
        }}
      /><span onClick={() => {
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
      }}>{this.checkOrComplete(this.props.warrents, this.state.warrent)}</span>
    </li>;
  }

  public render(): JSX.Element {
    return (
      <div>
        Warrents-List
        <ul>
          {this.props.warrents.pallets.map(i => {
            return <li key={i.key}>{i.initial.value}</li>;
          }).concat([this.renderInput()])}
        </ul>
      </div>
    );
  }

}

export default RcWarrents;
