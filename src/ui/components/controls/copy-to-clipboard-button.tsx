import * as React from 'react';
import { Button } from '@material-ui/core';

import CopyToClipboard = require('react-copy-to-clipboard');

export interface CopyToClipboardButtonProps {
  readonly data?: string;
}

export function CopyToClipboardBotton(props: CopyToClipboardButtonProps): JSX.Element {
  if (props.data && props.data.length > 1) {
    return <CopyToClipboard text={props.data}>
              <Button>Copy to clipboard</Button>
           </CopyToClipboard>;
  }
  return <></>;
}
