import * as React from 'react';
import * as ReactModal from 'react-modal';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import classnames from 'classnames';

import { Gpg2CardStatus, ChangeCard } from '../../../gpg/types';

import { Message } from '../../../model';
import { AppState } from '../../model';
import {
  ButtonToProgressor,
  ClavatorForm,
  InputPassword,
  InputValid,
  InputTypeObservable,
  InputType
} from '../controls';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  MenuItem,
  FormControl,
  Select,
  InputLabel
} from '@material-ui/core';

interface DialogChangeAttributesProps
  extends React.Props<DialogChangeAttributes> {
  readonly onClose: () => void;
  readonly cardStatus: Gpg2CardStatus;
  readonly appState: AppState;
}

@observer
export class DialogChangeAttributes extends React.Component<
  DialogChangeAttributesProps,
  {}
> {
  public readonly changeCard: ChangeCard;
  public readonly transaction: Message.Transaction<ChangeCard>;

  constructor(props: DialogChangeAttributesProps) {
    super(props);
    this.transaction = Message.newTransaction<ChangeCard>('ChangeCard.Request');
    this.changeCard = ChangeCard.fromCardStatus(this.props.cardStatus);
  }

  public updateAttributes(): () => void {
    return () => {
      this.transaction.data = this.changeCard;
      this.props.appState.channel.send(this.transaction.asMsg());
    };
  }

  public render(): JSX.Element {
    return (
      <Dialog open={true} scroll={'paper'}>
        <DialogTitle>
          ChangeAttributes:
          <br />
          {this.changeCard.name.get()}({this.changeCard.serialNo.get()})
        </DialogTitle>
        <DialogContent>
          <ClavatorForm>
            <InputPassword
              label="AdminPin"
              name="admin-pin"
              activeValue={this.changeCard.adminPin.pin}
            />
            <InputValid
              label="Name of cardholder"
              type={InputType.Text}
              activeValue={this.changeCard.name}
            />
            <InputValid
              label="Language prefs"
              type={InputType.Text}
              activeValue={this.changeCard.lang}
            />
            <FormControl>
              <InputLabel>Sex</InputLabel>
              <Select
                value={this.changeCard.sex.get()[0]}
                onChange={action((e: any) => {
                  this.changeCard.sex.set(e.target.value[0]);
                })}
              >
                <MenuItem value={'f'}>Female</MenuItem>
                <MenuItem value={'m'}>Male</MenuItem>
              </Select>
            </FormControl>
            <InputValid
              label="Login data"
              type={InputType.Text}
              activeValue={this.changeCard.login}
            />
            <InputValid
              label="Url"
              type={InputType.Text}
              activeValue={this.changeCard.url}
            />
          </ClavatorForm>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onClose}>close</Button>
          <ButtonToProgressor
            appState={this.props.appState}
            onClick={this.updateAttributes()}
            transaction={this.transaction}
          >
            Update
          </ButtonToProgressor>
        </DialogActions>
      </Dialog>
    );
  }
}
