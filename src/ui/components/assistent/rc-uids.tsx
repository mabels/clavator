import * as React from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Container, NestedFlag } from '../../../model';
import { KeyGenUid } from '../../../gpg/types';
import { action, observable } from 'mobx';
import { InputValid, InputType } from '../controls';
import { Input, Button } from '@material-ui/core';

interface RcUidsProps extends React.Props<RcUids> {
  readonly uids: Container<KeyGenUid>;
  readonly readOnly: NestedFlag;
  readonly completed?: boolean;
}

@observer
export class RcUids extends
  React.Component<RcUidsProps, {}> {

  constructor(props: RcUidsProps) {
    super(props);
    // this.state = {};
    // this.handleAddUid = this.handleAddUid.bind(this);
    // this.handleDelUid = this.handleDelUid.bind(this);
  }

  private handleDelUid = (idx: number): void => {
    if (this.props.uids.length > 1) {
      this.props.uids.del(idx);
    }
  }

  private render_delete_button(idx: number): JSX.Element {
    if (this.props.uids.length > 1) {
      return (
        <button type="button" onClick={this.handleDelUid.bind(this, idx)}>Delete Uid</button>
      );
    }
    return null;
  }

  @action
  private handleAddUid(/*idx: number */): void {
    const uid = new KeyGenUid();
    uid.name._value.set(this.props.uids.last().name.value);
    this.props.uids.add(uid);
  }

  private renderUid(idx: number, uid: KeyGenUid): JSX.Element {
    return <div className={classnames({
        'Uid': true,
        'u-full-width': true,
        'completed': this.props.completed,
        'good': uid.valid })} key={idx}>
      <div className="row">
        <div className="five columns">
          <InputValid
            label="Name-Real"
            type={observable.box(InputType.Text)}
            readOnly={this.props.readOnly.is}
            valid={uid.name.valid}
            name={`uid.name.${idx}`}
            value={uid.name._value} />
        </div>
        <div className="five columns">
          <InputValid
            label="Name-Email"
            type={observable.box(InputType.Email)}
            valid={uid.email.valid}
            readOnly={this.props.readOnly.is}
            autoComplete="on"
            name={`email.${idx}`}
            value={uid.email._value} />
        </div>
        <div className="two columns">
          {this.render_delete_button(idx)}
        </div>
      </div>
      <div className="row">
        <div className="ten columns">
          <label>Name-Comment:</label><input type="text"
            className={classnames({ 'u-full-width': true,
              good: uid.comment.valid,
              'readonly': this.props.readOnly.is
            })}
            disabled={this.props.readOnly.is}
            readOnly={this.props.readOnly.is}
            autoComplete="on"
            pattern={uid.comment.match.source}
            name={`nameComment.${idx}`}
            onChange={action((e: any) => {
              uid.comment._value.set(e.target.value);
            })}
            value={uid.comment.value} />
        </div>
        <div className="two columns">
          <Button type="button"
                  disabled={this.props.readOnly.is || !uid.valid}
                  onClick={action(() => this.handleAddUid())}>Add Uid</Button>
        </div>

      </div>
    </div>;
  }

  public render(): JSX.Element {
    return (
      <div className={classnames({
        'Uids': true,
        'good': this.props.uids.valid
      })}>
        {this.props.uids.map((sb: KeyGenUid, i: number) => {
          if (sb) {
            return this.renderUid(i, sb);
          }
        })}
      </div>
    );
  }

}
