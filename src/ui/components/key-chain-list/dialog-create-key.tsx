import * as React from 'react';
import * as ReactModal from 'react-modal';

import { NestedFlag } from '../../../model';
import { CreateKey } from './create-key';
import { AppState } from '../../model';
import { propTypes } from 'mobx-react';
import { Dialog, DialogActions, DialogTitle, DialogContent } from '@material-ui/core';

interface DialogCreateKeyProps extends React.Props<DialogCreateKey> {
  appState: AppState;
  // appElement: JSX.Element;
  onClose: () => void;
}

export class DialogCreateKey extends React.Component<DialogCreateKeyProps, {}> {
  private readonly readOnly: NestedFlag;

  constructor(props: DialogCreateKeyProps) {
    super(props);
    this.readOnly = new NestedFlag();
  }

  public render(): JSX.Element {
    return (
      <Dialog
        open={true}
        scroll={'paper'}
      >
        <DialogActions>
        <i onClick={() => {
              this.props.onClose();
            }}
           className="closeBox fa fa-close"></i>
        </DialogActions>
        <DialogTitle>Creating Key:</DialogTitle>
        <DialogContent>
        <CreateKey
          readOnly={this.readOnly}
          appState={this.props.appState} />
        </DialogContent>
      </Dialog>
    );
  }
}
