import * as React from 'react';
import * as ReactModal from 'react-modal';

import { NestedFlag } from '../../../model';
import { CreateKey } from './create-key';
import { AppState } from '../../model';

interface DialogCreateKeyState {
  readOnly: NestedFlag;
}

interface DialogCreateKeyProps extends React.Props<DialogCreateKey> {
  appState: AppState;
  onClose: () => void;
}

export class DialogCreateKey extends React.Component<DialogCreateKeyProps, DialogCreateKeyState> {

  constructor(props: DialogCreateKeyProps) {
    super(props);
    this.state = {
      readOnly: new NestedFlag()
    };
  }

  public render(): JSX.Element {
    return (
      <ReactModal
        isOpen={true}
        closeTimeoutMS={150}
        onAfterOpen={() => { /* */ }}
        contentLabel="Modal"
        shouldCloseOnOverlayClick={true}
      >
        <i onClick={() => {
              this.props.onClose();
            }}
           className="closeBox fa fa-close"></i>
        <h4>Creating Key:</h4>
        <CreateKey
          readOnly={this.state.readOnly}
          appState={this.props.appState} />
      </ReactModal>
    );
  }
}
