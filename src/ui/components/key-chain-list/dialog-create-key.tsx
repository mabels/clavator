import * as React from 'react';
import * as ReactModal from 'react-modal';

import { NestedFlag } from '../../../model';
import { CreateKey } from './create-key';
import { AppState } from '../../model';
import { propTypes } from 'mobx-react';

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
      <ReactModal
        isOpen={true}
        closeTimeoutMS={150}
        onAfterOpen={() => { /* */ }}
        contentLabel="Modal"
        shouldCloseOnOverlayClick={true}
        // appElement={this.props.appElement}
      >
        <i onClick={() => {
              this.props.onClose();
            }}
           className="closeBox fa fa-close"></i>
        <h4>Creating Key:</h4>
        <CreateKey
          readOnly={this.readOnly}
          appState={this.props.appState} />
      </ReactModal>
    );
  }
}
