import * as React from 'react';

import { Dispatch } from '../../model';

// import { AskPassphrase } from './ask-passphrase';
import { ReadAsciiRespond, InputPassword } from '../controls';
import { observable, IObservableValue, IObservableArray, action } from 'mobx';
import { KeyChainDialogQItem } from './key-chain-list';
import { observer } from 'mobx-react';
import { Dialog, DialogTitle, DialogActions, DialogContent, Button } from '@material-ui/core';
import { CopyToClipboardBotton } from '../controls/copy-to-clipboard-button';

interface DialogAskRenderAsciiProps extends React.Props<DialogAskRenderAscii> {
  onClose: () => void;
  // dialogQ: IObservableArray<KeyChainDialogQItem>;
  channel: Dispatch;
  current: KeyChainDialogQItem;
  // action: IObservableValue<string>;
}

@observer
export class DialogAskRenderAscii extends React.Component<DialogAskRenderAsciiProps, {}> {

  public readonly passPhrase: IObservableValue<string>;
  public readonly data: IObservableValue<string>;
  public readonly doRead: IObservableValue<boolean>;

  constructor(props: DialogAskRenderAsciiProps) {
    super(props);
    this.passPhrase = observable.box('');
    this.doRead = observable.box(false);
    this.data = observable.box();
  }

  public render(): JSX.Element {
    return (
      <Dialog
        open={true}
        scroll={'paper'}
      >
        <DialogTitle>{this.props.current.action}:{this.props.current.secKey.fingerPrint.fpr}</DialogTitle>
        <DialogContent>
        {!this.data.get() &&
          <InputPassword label="Passphrase" activeValue={this.passPhrase} />
        }
        {this.doRead.get() ? <ReadAsciiRespond
          action="pem-private"
          data={this.data}
          secKey={this.props.current.secKey}
          channel={this.props.channel}
          passPhrase={this.passPhrase.get()}
        /> : null}
        </DialogContent>
        <DialogActions>
          <CopyToClipboardBotton data={this.data.get()} />
          {!this.data.get() && this.passPhrase.get().length > 0 && <Button onClick={action((e: any) => {
            this.doRead.set(true);
          })}>Ready</Button>}
          <Button onClick={this.props.onClose}>close</Button>
        </DialogActions>
      </Dialog>
    );
  }
}
