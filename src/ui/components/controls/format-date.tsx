import * as React from 'react';
import { format_date } from '../../../model/helper';

interface FormatDateProps {
  readonly ticks: number;
}

export const FormatDate = (props: FormatDateProps) => {
  const d = new Date(1000 * this.props.ticks);
  return <span key={this.props.ticks}>{format_date(d)}</span>;
};
