
import * as React from 'react';
import * as classnames from 'classnames';

// import MutableString from '../gpg/mutable_string';

export enum Steps {
  None = 0x0,
  CreateKey = 0x1,
  CheckCard = 0x2,
  SendToCard = 0x4,
  Completed = 0x8
}

interface ActionsState {
  completed: Steps;
}

interface ActionsProps extends React.Props<Actions> {
  onClick: (action: Steps) => void;
  current: Steps;
  completed: Steps;
}

export class Actions
  extends React.Component<ActionsProps, ActionsState> {
  constructor() {
    super();
    this.state = {
      completed: Steps.None
    };
  }

  public classnames(action: Steps): string {
    return classnames({
      ReactTabs__Tab: true,
      active: this.props.current == action,
      completed: !!(this.state.completed & action)
    });
  }

  public render(): JSX.Element {
    return (
      <div>
        <div className="ReactTabs react-tabs row">
          <ul className="Actions ReactTabs__TabList">
            <li onClick={() => this.props.onClick(Steps.CreateKey)}
              className={this.classnames(Steps.CreateKey)}>Create-Key</li>
            <li onClick={() => this.props.onClick(Steps.CheckCard)}
              className={this.classnames(Steps.CheckCard)}>CheckCard</li>
            <li onClick={() => this.props.onClick(Steps.SendToCard)}
              className={this.classnames(Steps.SendToCard)}>Send-To-Card</li>
            <li onClick={() => this.props.onClick(Steps.Completed)}
              className={this.classnames(Steps.Completed)}>Completed</li>
          </ul>
        </div>
        {this.props.children}
      </div>
    );
  }
}

export default Actions;
