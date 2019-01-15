import * as React from 'react';
import { observer } from 'mobx-react';
import * as classnames from 'classnames';
import Warrents from '../../../gpg/warrents';
import Warrent from '../../../gpg/warrent';
// import Warrents from '../../model/view-warrents';

interface RcWarrentsState {
  // warrent: Warrent;
  done: boolean;
}

interface RcWarrentsProps extends React.Props<RcWarrents> {
  warrents: Warrents;
  completed: () => void;
}

@observer export class RcWarrents extends
  React.Component<RcWarrentsProps, RcWarrentsState> {

  constructor(props: RcWarrentsProps) {
    super(props);
    this.state = {
      // warrent: new Warrent(),
      done: false
    };
    this.handlePressEnter = this.handlePressEnter.bind(this);
    this.addClick = this.addClick.bind(this);
  }

  private checkOrComplete(warrents: Warrents, warrent: Warrent): string {
    const text = warrents.valid() ? 'add' : '';
    if (warrents.length() > 1) {
      return warrent.warrent.value.length ? text : 'done';
    }
    return text;
  }

  private addClick(): void {
    switch (this.checkOrComplete(this.props.warrents, this.props.warrents.last())) {
      case 'add':
        this.props.warrents.add(new Warrent());
        // this.setState({
          // warrent: new Warrent()
        // });
        break;
      case 'done':
        this.props.warrents.pop();
        this.setState({ done: true });
        this.props.completed();
        break;
    }
  }

  private renderButton(): JSX.Element {
    const coc = this.checkOrComplete(this.props.warrents, this.props.warrents.last());
    if (coc.length <= 1) {
      return null;
    }
    const clazz: any = { };
    clazz[coc] = true;
    return <button className={classnames(clazz)}
      onClick={this.addClick}>{coc}</button>;
  }

  private handlePressEnter(e: any): void {
    if (e.key === 'Enter') {
      console.log('do validate');
      this.addClick();
    }
  }

  private renderInput(): JSX.Element {
    // console.log('-1-');
    if (this.state.done) {
      return null ;
    }
    // console.log('-2-', this.props.warrents.last().key);
    return <li key={this.props.warrents.last().objectId()}>
      <input type="text"
        autoFocus
        className={classnames({
           good: this.props.warrents.valid()
        })}
        value={this.props.warrents.last().warrent.value}
        onKeyPress={this.handlePressEnter}
        onChange={(e: any) => {
          this.props.warrents.last().warrent.value = e.target.value;
          // this.setState(this.tate);
        }}
      />{this.renderButton()}
    </li>;
  }

  public render(): JSX.Element {
    return (
        <ol className="WarrentsList">
          {this.props.warrents.map((i, idx) => {
            if (idx == this.props.warrents.length() - 1) {
              // console.log(`Input:Warrents:${idx}:${this.props.warrents.length()}`);
              return this.renderInput();
            } else {
              // console.log(`Li:Warrents:${idx}:${this.props.warrents.length()}`);
              return <li key={i.objectId()}>{i.warrent.value}</li>;
            }
          })}
        </ol>
    );
  }

}

export default RcWarrents;
