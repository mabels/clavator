import * as React from 'react';
import { format_date } from '../../../model/helper';

interface FormatDateProps {
  readonly ticks: number;
}

export function FormatDate(props: FormatDateProps): JSX.Element {
  const d = new Date(1000 * props.ticks);
  return <span key={props.ticks}>{format_date(d)}</span>;
}
