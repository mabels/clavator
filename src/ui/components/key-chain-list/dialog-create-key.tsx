import * as React from 'react';

import { NestedFlag } from '../../../model';
import { CreateKey } from './create-key';
import { AppState } from '../../model';
import { propTypes } from 'mobx-react';
import {
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Button
} from '@material-ui/core';
import { action } from 'mobx';

interface DialogCreateKeyProps extends React.Props<DialogCreateKey> {
  readonly appState: AppState;
  readonly open: boolean;
  // appElement: JSX.Element;
  readonly onClose: () => void;
}

export class DialogCreateKey extends React.Component<DialogCreateKeyProps, {}> {
  private readonly readOnly: NestedFlag;

  constructor(props: DialogCreateKeyProps) {
    super(props);
    this.readOnly = new NestedFlag();
  }

  public render(): JSX.Element {
    return (
      <Dialog open={this.props.open} scroll={'paper'}>
        <DialogTitle>Creating Key:</DialogTitle>
        <DialogActions>
          <Button
            onClick={action(() => {
              this.props.onClose();
            })}
          >
            close
          </Button>
        </DialogActions>
        <DialogContent>
          <CreateKey readOnly={this.readOnly} appState={this.props.appState} />
        </DialogContent>
      </Dialog>
    );
  }
}
