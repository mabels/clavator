import * as React from 'react';
import { observer } from 'mobx-react';

import { Dispatch } from '../../model';
import { ReadAsciiRespond, CopyToClipboardBotton } from '../controls';
import { IObservableValue, IObservableArray, observable } from 'mobx';
import { KeyChainDialogQItem } from './key-chain-list';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core';

interface DialogRenderAsciiProps {
  readonly onClose: () => void;
  readonly channel: Dispatch;
  // readonly dialogQ: IObservableArray<KeyChainDialogQItem>;
  readonly current: KeyChainDialogQItem;
  // readonly action: IObservableValue<string>;
  // readonly passPhrase: IObservableValue<string>;
}

@observer
export class DialogRenderAscii extends React.Component<DialogRenderAsciiProps> {

  private readonly data: IObservableValue<string> = observable.box();

  public render(): JSX.Element {
    const props = this.props;
    return (
      <Dialog
        open={true}
        scroll={'paper'}
      >
        <DialogActions>
          <CopyToClipboardBotton data={this.data.get()}/>
          <Button onClick={props.onClose}>close</Button>
        </DialogActions>
        <DialogTitle>{props.current.action}:{props.current.secKey.fingerPrint.fpr}</DialogTitle>
        <DialogContent>
        <ReadAsciiRespond
          action={props.current.action}
          channel={props.channel}
          secKey={props.current.secKey}
          data={this.data}
         /></DialogContent>
      </Dialog>
    );
  }
}
