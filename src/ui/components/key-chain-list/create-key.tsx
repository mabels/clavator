
import * as React from 'react';
import * as classnames from 'classnames';
import * as Message from '../../../model/message';
// import * as WsChannel from '../../model/ws-channel';
import * as KeyGen from '../../../gpg/key-gen';
import KeyGenUid from '../../../gpg/key-gen-uid';
import Option from '../../../model/option';
import MultiOption from '../../../model/multi-option';
import NestedFlag from '../../../model/nested-flag';
// import { format_date } from '../../../model/helper';
// import * as ReactModal from 'react-modal';
// import { Progressor } from './progressor';
import ButtonToProgressor from '../controls/button-to-progressor';
import * as ListSecretKeys from '../../../gpg/list-secret-keys';
import InputExpireDate from '../controls/input-expire-date';
// import { StringValue } from '../../../model/string-value';
import RcDoublePassword from '../controls/rc-double-password';
// import DoublePassword from '../../model/double-password';
import PassPhrase from '../../model/pass-phrase';
// import MinMax from '../../model/min-max';
import CharFormat from '../../model/char-format';
import { Warrents } from '../../../gpg/warrents';
import { Warrent } from '../../../gpg/warrent';
// import { ProgressorState } from '../controls/progressor';
import AppState from '../../model/app-state';

interface CreateKeyState {
  createDialog: boolean;
  completed: boolean;
  keyGen: KeyGen.KeyGen;
  create_status: string;
  transaction: Message.Transaction<KeyGen.KeyGen>;
  passPhrase: PassPhrase;
}

interface CreateKeyProps extends React.Props<CreateKey> {
  appState: AppState;
  compact?: boolean;
  onComplete?: () => void;
  renderSubmit?: (ck: CreateKey) => JSX.Element;
  secretKey?: ListSecretKeys.SecretKey;
  readOnly: NestedFlag;
}

export class CreateKey extends React.Component<CreateKeyProps, CreateKeyState> {

  constructor(props: CreateKeyProps) {
    super(props);
    let kg = KeyGen.KeyGen.withSubKeys(3);
    kg.uids.add(new KeyGenUid());
    this.state = {
      createDialog: false,
      completed: false,
      keyGen: kg,
      create_status: 'create-key',
      transaction: null,
      passPhrase: PassPhrase.createPerWarrent(
        new Warrents([new Warrent('me')]), [], CharFormat.wildcard(),
        'password error', '', 1)
    };
    this.create_key = this.create_key.bind(this);
  }

  public componentWillMount(): void {
    if (this.props.secretKey) {
      this.setState({
        keyGen: this.props.secretKey.toKeyGen(3)
      });
      console.log('CreateKey:componentWillMount', this.props.secretKey);
    }
    this.props.appState.channel.onMessage((h: Message.Header, data: string) => {
// console.log('CreateKey:', h, this.state.transaction.header)
      if (this.state.transaction &&
          this.state.transaction.header.transaction == h.transaction &&
          h.action == 'CreateKeySet.Completed') {
            let skey = null;
            if (data && this.props.secretKey) {
              this.props.secretKey.jsfill(JSON.parse(data));
            }
            console.log('CreateKey:Matched', h, this.state.transaction.header, this.props, skey);
            if (this.props.onComplete) {
               this.props.onComplete();
            }
          }
    });
  }

  private handleDelUid(idx: number): void {
    if (this.state.keyGen.uids.length() > 1) {
      this.state.keyGen.uids.del(idx);
      this.setState(Object.assign({}, this.state, {
        keyGen: this.state.keyGen
      }));
    }
  }

  private handleAddUid(): void {
    let uid = new KeyGenUid();
    uid.name.value = this.state.keyGen.uids.last().name.value;
    this.state.keyGen.uids.add(uid);
    this.setState(Object.assign({}, this.state, {
      keyGen: this.state.keyGen
    }));
  }

  public render_option<T>(name: string, ops: Option<T>[]): JSX.Element {
    let value = '';
    let ret = ops[0].map((s, o) => {
      value = s ? o.toString() : value;
      return (<option key={o.toString()} value={o.toString()}>{o}</option>);
    });
    return (
      <select className="u-full-width" name={name} defaultValue={value} onChange={(e: any) => {
        ops.forEach((op) => {
          op.value = e.target.value;
        });
        this.setState(this.state);
      }}>
        {ret}
      </select>
    );
  }

  public render_multioption<T>(name: string, op: MultiOption<T>): JSX.Element {
    // <input type='checkbox' name={name} value={v} {s?'checked':''}>{v}</input>)}
    return (
      <div>
        {op.map((s: boolean, v: T) => {
          return (
            <span key={v.toString()} style={{ marginRight: '0.2em', float: 'left' }}>
              <label>{v}</label>
              <input className="u-full-width" type="checkbox" checked={s} name={name}
                value={v.toString()}
                onChange={(e: any) => {
                  let ofs = op.values.findIndex((a) => a == v);
                  if (e.target.checked) {
                    if (ofs < 0) {
                      op.values.push(v);
                      // console.log('add_value', v, e.target.checked, op.values, this.state.keyGen.keyUsage);
                    }
                  } else {
                    if (ofs >= 0) {
                      op.values[ofs] = op.values[op.values.length - 1];
                      op.values = op.values.slice(0, -1);
                    }
                  }
                  this.setState(this.state);
                }}
              />
            </span>);
        })
        }
      </div>
    );
  }

  public create_key(): void {
    let transaction = Message.newTransaction('CreateKeySet.Request', this.state.keyGen);
    this.setState({
      transaction: transaction,
      createDialog: true
    });
    this.props.appState.channel.send(transaction.asMsg());
  }

  // public render_password(label: string, key: string, pp: StringValue): JSX.Element {
  //   return (
  //     <div className={classnames({ six: true, columns: true })} >
  //       <label>{label}:</label><input type="password"
  //         name={key}
  //         className={classnames({ 'u-full-width': true, good: pp.valid() })}
  //         onChange={(e: any) => {
  //           pp.value = e.target.value;
  //           this.setState(this.state);
  //         }}
  //       />
  //     </div>);
  // }

  // public render_verify_password(label: string, key: string, pp: StringValue): JSX.Element {
  //   return (
  //     <div className="six columns">
  //       <label>{label}(verify):</label><input type="password"
  //         name={key + '-verify'}
  //         className={classnames({ 'u-full-width': true, good: pp.valid_verify() })}
  //         onChange={(e: any) => {
  //           pp.verify = e.target.value;
  //           this.setState(this.state);
  //         }}
  //       />
  //     </div>);
  // }

  public render_delete_button(idx: number): JSX.Element {
    if (this.state.keyGen.uids.length() > 1) {
      return (
        <button type="button" onClick={this.handleDelUid.bind(this, idx)}>Delete Uid</button>
      );
    }
    return null;
  }

  public render_uid(idx: number, uid: KeyGenUid): JSX.Element {
    return (
      // <div className={classnames({ 'u-full-width': true, 'good': uid.valid() })} key={idx}>
      <div className={classnames({ 'good': uid.valid() })} key={idx}>
        <div className="row">
          <div className="five columns">
            <label>Name-Real:</label><input type="text"
              className={classnames({ 'u-full-width': true, 'good': uid.name.valid() })}
              name={`uid.name.{idx}`}
              onChange={(e: any) => {
                uid.name.value = e.target.value;
                this.setState(this.state);
              }}
              value={uid.name.value} />
          </div>
          <div className="five columns">
            <label>Name-Email:</label><input type="email"
              className={classnames({ 'u-full-width': true, good: uid.email.valid() })}
              autoComplete="on"
              name="email"
              onChange={(e: any) => {
                uid.email.value = e.target.value;
                this.setState(this.state);
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
              className={classnames({ 'u-full-width': true, good: uid.comment.valid() })}
              autoComplete="on"
              required={true}
              name="nameComment"
              onChange={(e: any) => {
                uid.comment.value = e.target.value;
                this.setState(this.state);
              }}
              value={uid.comment.value} />
          </div>
          <div className="two columns">
            <button type="button" onClick={this.handleAddUid.bind(this)}>Add Uid</button>
          </div>

        </div>
      </div>);
  }

  public render_compact(): JSX.Element {
    if (!this.props.compact) {
      return null;
    }
    return <div className="row">
      <div className="three columns">
        <label>Master-Key-Length:</label>{this.render_option('masterKeyLength', [this.state.keyGen.keyInfo.length])}
      </div>
      <div className="three columns">
        <label>Slave-Key-Length:</label>{this.render_option('subkeys.all.length',
        this.state.keyGen.subKeys.map((sb: KeyGen.KeyInfo, i: number) => {
          return sb.length;
        }))}
      </div>
    </div>;
  }

  public render_long(): JSX.Element {
    if (this.props.compact) {
      return null;
    }
    return <div>
      <div className="row">
        <div className="two columns">MasterKey</div>
        <div className="three columns">
          <label>Key-Type:</label>{this.render_option('keyType', [this.state.keyGen.keyInfo.type])}
        </div>
        <div className="three columns">
          <label>Master-Key-Length:</label>{this.render_option('masterKeyLength', [this.state.keyGen.keyInfo.length])}
        </div>
        <div className="three columns">
          <label>Key-Usage:</label>{this.render_multioption('keyUsage', this.state.keyGen.keyInfo.usage)}
        </div>
      </div>

      {this.state.keyGen.subKeys.map((sb: KeyGen.KeyInfo, i: number) => {
        return (<div className="row" key={i}>
          <div className="two columns">SubKey {i}</div>
          <div className="three columns">
            <label>Key-Type:</label>{this.render_option('subkeys.' + i + '.keyType', [sb.type])}
          </div>
          <div className="three columns">
            <label>Key-Length:</label>{this.render_option('subkeys.' + i + '.length', [sb.length])}
          </div>
          <div className="three columns">
            <label>Key-Usage:</label>{this.render_multioption('subkeys.' + i + '.usage', sb.usage)}
          </div>
        </div>);
      })}
    </div>;
  }

  public render_create(): JSX.Element {
    if (this.props.renderSubmit) {
      return this.props.renderSubmit(this);
    }
    return <ButtonToProgressor
            appState={this.props.appState}
            onClick={this.create_key}
            transaction={this.state.transaction}
          >Create Key</ButtonToProgressor>;
  }

  public render_form(): JSX.Element {
    return (
      <form onSubmit={(e) => {
        // debugger;
        e.stopPropagation();
        e.preventDefault();
      }}>
      <InputExpireDate
        readOnly={this.props.readOnly}
        title="Expire-Date"
        expireDate={this.state.keyGen.expireDate} />

        {this.state.keyGen.uids.map((sb: KeyGenUid, i: number) => {
          if (sb) {
            return this.render_uid(i, sb);
          }
        })}

        <RcDoublePassword
            readOnly={this.props.readOnly}
            key={this.state.passPhrase.objectId()}
            doublePassword={this.state.passPhrase.doublePasswords[0]}
            idx={null} >
        </RcDoublePassword>;
        {/*
        <div className={classnames({ row: true, good: this.state.keyGen.password.valid() })}>
          {this.render_password('Password', 'cq-password', this.state.keyGen.password)}
          {this.render_verify_password('Password', 'cq-password', this.state.keyGen.password)}
        </div>
        */}
        {this.render_long()}
        {this.render_compact()}

        <div className="row">
          {this.render_create()}
        </div>
      </form>
    );
  }

  public render(): JSX.Element {
    return (
      <div className="row CreateKey" >
        {this.render_form()}
      </div>
    );
  }

}

export default CreateKey;
