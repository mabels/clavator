import * as React from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Container, NestedFlag } from '../../../model';
import { KeyGenUid } from '../../../gpg/types';

interface RcUidsProps extends React.Props<RcUids> {
  uids: Container<KeyGenUid>;
  readOnly: NestedFlag;
  completed?: boolean;
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

  private handleAddUid = (/*idx: number */): void => {
    let uid = new KeyGenUid();
    uid.name._value.set(this.props.uids.last().name.value);
    this.props.uids.add(uid);
  }

  private render_delete_button(idx: number): JSX.Element {
    if (this.props.uids.length > 1) {
      return (
        <button type="button" onClick={this.handleDelUid.bind(this, idx)}>Delete Uid</button>
      );
    }
    return null;
  }

  private renderUid(idx: number, uid: KeyGenUid): JSX.Element {
    return <div className={classnames({
        'Uid': true,
        'u-full-width': true,
        'completed': this.props.completed,
        'good': uid.valid() })} key={idx}>
      <div className="row">
        <div className="five columns">
          <label>Name-Real:</label><input
            type="text"
            autoFocus
            className={classnames({ 'u-full-width': true,
              'good': uid.name.valid(),
              'readonly': this.props.readOnly.is
            })}
            disabled={this.props.readOnly.is}
            readOnly={this.props.readOnly.is}
            pattern={uid.name.match.source}
            name={`uid.name.${idx}`}
            onChange={(e: any) => {
              uid.name._value.set(e.target.value);
            }}
            value={uid.name.value} />
        </div>
        <div className="five columns">
          <label>Name-Email:</label><input type="email"
            className={classnames({ 'u-full-width': true,
              good: uid.email.valid(),
              'readonly': this.props.readOnly.is
            })}
            disabled={this.props.readOnly.is}
            readOnly={this.props.readOnly.is}
            autoComplete="on"
            pattern={uid.email.match.source}
            name={`email.${idx}`}
            onChange={(e: any) => {
              uid.email._value.set(e.target.value);
            }}
            value={uid.email.value} />
        </div>
        <div className="two columns">
          {this.render_delete_button(idx)}
        </div>
      </div>
      <div className="row">
        <div className="ten columns">
          <label>Name-Comment:</label><input type="text"
            className={classnames({ 'u-full-width': true,
              good: uid.comment.valid(),
              'readonly': this.props.readOnly.is
            })}
            disabled={this.props.readOnly.is}
            readOnly={this.props.readOnly.is}
            autoComplete="on"
            pattern={uid.comment.match.source}
            name={`nameComment.${idx}`}
            onChange={(e: any) => {
              uid.comment._value.set(e.target.value);
            }}
            value={uid.comment.value} />
        </div>
        <div className="two columns">
          <button type="button"
                  className={classnames({
                    AddUid: true,
                    'bad': uid.valid()
                  })}
                  disabled={this.props.readOnly.is || !uid.valid()}
                  onClick={this.handleAddUid/*.bind(this)*/}>Add Uid</button>
        </div>

      </div>
    </div>;
  }

  public render(): JSX.Element {
    return (
      <div className={classnames({
        'Uids': true,
        'good': this.props.uids.valid()
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
