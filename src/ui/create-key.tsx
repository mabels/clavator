
import * as React from 'react';

import * as classnames from 'classnames';

import './app.less';

import * as Message from '../message';

import * as WsChannel from './ws-channel';

import * as KeyGen from '../gpg/key-gen';


interface CreateKeyState {
  create: boolean,
  keyGen: KeyGen.KeyGen
  create_status: string
}

interface CreateKeyProps extends React.Props<CreateKey> {
  channel: WsChannel.Dispatch;
}

export class CreateKey extends React.Component<CreateKeyProps, CreateKeyState> {

  constructor() {
    super();
    let kg = KeyGen.KeyGen.withSubKeys(3);
    kg.uids.add(new KeyGen.Uid());
    this.state = {
      create: false,
      keyGen: kg,
      create_status: "create-key"
    };
    // this.handleCreateClick = this.handleCreateClick.bind(this);
  }
  // public static contextTypes = {
  //  socket: React.PropTypes.object
  // };

  private handleDelUid(idx: number) {
    if (this.state.keyGen.uids.pallets.length > 1) {
      delete this.state.keyGen.uids.pallets[idx];
      this.setState(Object.assign({}, this.state, {
        keyGen: this.state.keyGen
      }));
    }
  }

  private handleAddUid() {
    let uid = new KeyGen.Uid();
    let compacted = this.state.keyGen.uids.pallets.filter((i) => i);
    uid.name.value = compacted[compacted.length - 1].name.value;
    this.state.keyGen.uids.add(uid);
    this.setState(Object.assign({}, this.state, {
      keyGen: this.state.keyGen
    }));
  }
  onMessage(action: Message.Header, data: string) {
    if (action.action == "Progressor.Clavator" && JSON.parse(data).isEndOfMessages) {
      this.setState(Object.assign({}, this.state, {
        create_status: "create-key"
      }));
    }
  }
  onClose(e: CloseEvent) {
    // this.setState(Object.assign({}, this.state, { cardStatusList: [] }));
  }

  componentWillReceiveProps(nextProps: any, nextContext: any) {
    if (nextProps.channel) {
      nextProps.channel.register(this);
    }
  }

  public render_option<T>(name: string, op: KeyGen.Option<T>): JSX.Element {
    //return(<option value={o} {s?"selected":""}>{o}</option>)
    let value = "";
    let ret = op.map((s, o) => {
      value = s ? o.toString() : value;
      return (<option key={o.toString()} value={o.toString()}>{o}</option>)
    });
    // debugger
    return (
      <select className="u-full-width" name={name} defaultValue={value} onChange={(e: any) => {
        op.value = e.target.value;
        this.setState(this.state);
      }
      }>
        {ret}
      </select>
    )
  }

  public render_multioption<T>(name: string, op: KeyGen.MultiOption<T>): JSX.Element {
    // <input type="checkbox" name={name} value={v} {s?"checked":""}>{v}</input>)}
    return (
      <div>
        {op.map((s: boolean, v: T) => {
          return (
            <span key={v.toString()} style={{ marginRight: "0.2em", float: "left" }}>
              <label>{v}</label>
              <input className="u-full-width" type="checkbox" checked={s} name={name}
                value={v.toString()}
                onChange={(e: any) => {
                  let ofs = op.values.findIndex((a) => a == v)
                  if (e.target.checked) {
                    if (ofs < 0) {
                      op.values.push(v);
                      // console.log("add_value", v, e.target.checked, op.values, this.state.keyGen.keyUsage);
                    }
                  } else {
                    if (ofs >= 0) {
                      op.values[ofs] = op.values[op.values.length - 1];
                      op.values = op.values.slice(0, -1)
                    }
                  }
                  this.setState(this.state);
                }}
              />
            </span>)
        })
        }
      </div>
    )
  }

  public create_key() {
    console.log("create_key", this);
    // this.state.create_status = "requested";
    this.setState(this.state);
    // debugger
    this.props.channel.send(Message.prepare("CreateKeySet", this.state.keyGen), (error: any) => {
      // this.state.create_status = "err("+error+")";
      this.setState(this.state);
    });
  }

  // public isGood(valid: boolean) : string {
  //   return (valid) ? "good" : "unknown"
  // }
  public render_password(label: string, key: string, pp: KeyGen.PwPair): JSX.Element {
    return (
      <div className={classnames({ six: true, columns: true })} >
        <label>{label}:</label><input type="password"
          name={key} required={true}
          className={classnames({ "u-full-width": true, good: pp.valid_password() })}
          onChange={(e: any) => {
            pp.password = e.target.value;
            this.setState(this.state);
          }}
        />
      </div>)
  }

  public render_verify_password(label: string, key: string, pp: KeyGen.PwPair): JSX.Element {
    return (
      <div className="six columns">
        <label>{label}(verify):</label><input type="password"
          name={key + "-verify"} required={true}
          className={classnames({ "u-full-width": true, good: pp.valid_verify() })}
          onChange={(e: any) => {
            pp.verify = e.target.value;
            this.setState(this.state);
          }}
        />
      </div>)
  }
  public render_delete_button(idx: number): JSX.Element {

    if (this.state.keyGen.uids.pallets.filter((i) => i).length > 1) {
      return (
        <button type="button" onClick={this.handleDelUid.bind(this, idx)}>Delete Uid</button>
      );
    }
    return null;
  }
  public render_uid(idx: number, uid: KeyGen.Uid): JSX.Element {
    return (
      <div className={classnames({ "u-full-width": true, "good": uid.valid() })} key={idx}>
        <div className="row">
          <div className="five columns">
            <label>Name-Real:</label><input type="text"
              className={classnames({ "u-full-width": true, "good": uid.name.valid() })}
              required={true}
              name="uid.name.{idx}"
              onChange={(e: any) => {
                uid.name.value = e.target.value;
                this.setState(this.state);
              }}
              value={uid.name.value} />
          </div>
          <div className="five columns">
            <label>Name-Email:</label><input type="email"
              className={classnames({ "u-full-width": true, good: uid.email.valid() })}
              autoComplete="on"
              required={true}
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
              className={classnames({ "u-full-width": true, good: uid.comment.valid() })}
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

  public render_form(): JSX.Element {
    // if (!this.state.create) {
    //     return (<span></span>)
    // }
    // <div className="three columns">
    // <label>Sub-Key-Length:</label>{this.render_option("subKeyLength", this.state.keyGen.subKeyLength)}
    // </div>

    return (
      <form>
        <div className="row">
          <div className="three columns">
            <label>Expire-Date:</label><input type="date" name="expireDate"
              className={classnames({ good: this.state.keyGen.expireDate.valid() })}
              autoComplete="on"
              required={true}
              min={Date.now()}
              onChange={(e: any) => {
                this.state.keyGen.expireDate.value = new Date(e.target.value);
                this.setState(this.state);
              }}
              defaultValue={KeyGen.format_date(this.state.keyGen.expireDate.value)}
            />
          </div>
        </div>

        {this.state.keyGen.uids.pallets.map((sb: KeyGen.Uid, i: number) => {
          if (sb) {
            return this.render_uid(i, sb)
          }
        })}

        <div className={classnames({ row: true, good: this.state.keyGen.password.valid() })}>
          {this.render_password("Password", "cq-password", this.state.keyGen.password)}
          {this.render_verify_password("Password", "cq-password", this.state.keyGen.password)}
        </div>


        <div className="row">
          <div className="two columns">MasterKey</div>
          <div className="three columns">
            <label>Key-Type:</label>{this.render_option("keyType", this.state.keyGen.keyInfo.type)}
          </div>
          <div className="three columns">
            <label>Master-Key-Length:</label>{this.render_option("masterKeyLength", this.state.keyGen.keyInfo.length)}
          </div>
          <div className="three columns">
            <label>Key-Usage:</label>{this.render_multioption("keyUsage", this.state.keyGen.keyInfo.usage)}
          </div>
        </div>

        {this.state.keyGen.subKeys.pallets.map((sb: KeyGen.KeyInfo, i: number) => {
          return (<div className="row" key={i}>
            <div className="two columns">SubKey {i}</div>
            <div className="three columns">
              <label>Key-Type:</label>{this.render_option("subkeys." + i + ".keyType", sb.type)}
            </div>
            <div className="three columns">
              <label>Key-Length:</label>{this.render_option("subkeys." + i + ".length", sb.length)}
            </div>
            <div className="three columns">
              <label>Key-Usage:</label>{this.render_multioption("subkeys." + i + ".usage", sb.usage)}
            </div>
          </div>)
        })}


        <div className="row">
          <div className="four columns"> </div>
          <div className={classnames({ four: true, columns: true, good: this.state.keyGen.valid() })} >
            <button type="button"
              onClick={this.create_key.bind(this)}
              disabled={!this.state.keyGen.valid()}>{this.state.create_status}</button>
          </div>
        </div>
      </form>
    );
    // min={KeyGen.format_date(Date.now())}
    // value={KeyGen.format_date(this.state.keyGen.expireDate)} />
  }


  public render(): JSX.Element {
    // <h3>CreateKey</h3>
    return (
      <div className="row CreateKey" >
        {this.render_form()}
      </div>
    );
  }

}
