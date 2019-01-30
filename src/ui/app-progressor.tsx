import * as React from 'react';
import * as ReactModal from 'react-modal';
import { AppState } from './model/app-state';
import { observer } from 'mobx-react';
import { Progressor, ProgressorState } from './components/controls/progressor';
import { action } from 'mobx';
import { Dialog } from '@material-ui/core';

export interface ProgressorProps {
  progressState: ProgressorState;
}

export const AppProgressor = observer((props: ProgressorProps): JSX.Element => {
    /*
    if (!this.state.openProgressor) {
      return null;
    }
    */
    return (
      <Dialog
        open={props.progressState.open.get()}
      >
        <i
          onClick={action(() => {
            props.progressState.open.set(false);
          })}
          className="closeBox fa fa-close"
        />
        <Progressor
          progressor={props.progressState}
          msg={'Clavator'}
          controls={true}
        />
      </Dialog>
    );
  }
);
