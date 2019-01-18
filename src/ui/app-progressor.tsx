import * as React from 'react';
import * as ReactModal from 'react-modal';
import { AppState } from './model/app-state';
import { observer } from 'mobx-react';
import { Progressor, ProgressorState } from './components/controls/progressor';

export interface ProgressorProps {
  progressState: ProgressorState;
}

export const AppProgressor = observer(
  (props: ProgressorProps): JSX.Element => {
    /*
    if (!this.state.openProgressor) {
      return null;
    }
    */
    return (
      <ReactModal
        isOpen={props.progressState.open.get()}
        closeTimeoutMS={150}
        onAfterOpen={() => {
          /* */
        }}
        contentLabel="Modal"
        shouldCloseOnOverlayClick={true}
      >
        <i
          onClick={() => {
            props.progressState.open.set(false);
          }}
          className="closeBox fa fa-close"
        />
        <Progressor
          progressor={props.progressState}
          msg={'Clavator'}
          controls={true}
        />
      </ReactModal>
    );
  }
);
