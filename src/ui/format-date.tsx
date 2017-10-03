import * as React from 'react';
import { format_date } from '../gpg/helper';

interface FormatDateState {
}

interface FormatDateProps extends React.Props<FormatDate> {
  ticks: number;
}

export class FormatDate
  extends React.Component<FormatDateProps, FormatDateState> {

  constructor() {
    super();
    this.state = {};
  }

  public render(): JSX.Element {
    let d = new Date(1000 * this.props.ticks);
    return (
      <span key={this.props.ticks}>
        {format_date(d)}
      </span>
    );
  }
}

export default FormatDate;
