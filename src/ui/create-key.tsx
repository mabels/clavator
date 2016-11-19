
import * as React from 'react';
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
    this.state = {
      create: false,
      keyGen: null,
      create_status: "create-key"
    };
    this.handleCreateClick = this.handleCreateClick.bind(this);
  }
  // public static contextTypes = {
  //  socket: React.PropTypes.object
  // };

  private handleCreateClick() {
    let keyGen = this.state.keyGen || (new KeyGen.KeyGen());
    let create = this.state.create || true;
    // console.log("keyGen=>", keyGen);
    // this.props.channel.send(Message.prepare("CreateKeySet", keyGen), (error: any) => {
    //   this.state.create_status = "err("+error+")";
    //   this.setState(this.state);
    // });

    this.setState(Object.assign({}, this.state, {
      keyGen: keyGen,
      create: create
    }));
  }

  protected componentDidMount(): void {

  }

  protected componentWillUnmount(): void {
  }

  onMessage(action: Message.Header, data: string) {
    if (action.action == "Progressor.CreateKeySet" && JSON.parse(data).isEndOfMessages) {
      this.setState(Object.assign({}, this.state, {
        create_status: "create-key"
      }));
    }
  }
  onClose(e:CloseEvent) {
    this.setState(Object.assign({}, this.state, { cardStatusList: [] }));
  }



  componentWillReceiveProps(nextProps: any, nextContext: any) {
    if (nextProps.channel) {
      nextProps.channel.register(this);
    }
  }

  shouldComponentUpdate(nextProps: any,  nextState: any,  nextContext: any) : boolean {
    // debugger
    return true;
  }

  componentWillUpdate(nextProps: any, nextState: any, nextContext: any) {
    // debugger
  }

  componentDidUpdate(prevProps: any, prevState: any, prevContext: any) {
    // debugger
  }


  public render_option<T>(name: string, op: KeyGen.Option<T>) : JSX.Element {
        //return(<option value={o} {s?"selected":""}>{o}</option>)
    let value = "";
    let ret = op.map((s, o) => {
      value = s ? o.toString() : value;
      return(<option key={o.toString()} value={o.toString()}>{o}</option>)
    });
    // debugger
    return (
      <select className="u-full-width" name={name} defaultValue={value} onChange={(e:any) => {
          op.value = e.target.value;
          this.setState(this.state);
        }
      }>
        {ret}
      </select>
    )
  }

  public render_multioption<T>(name: string, op: KeyGen.MultiOption<T>) : JSX.Element {
    // <input type="checkbox" name={name} value={v} {s?"checked":""}>{v}</input>)}
    return (
      <div>
      {op.map((s:boolean, v:T) => {
          return (
            <span>
            <label key={v.toString()}>{v}</label>
            <input className="u-full-width" type="checkbox" checked={s} name={name}
                  value={v.toString()}
                  onChange={(e:any) => {
                    let ofs = op.values.findIndex((a)=> a==v)
                    if (e.target.checked) {
                      if (ofs < 0) {
                        op.values.push(v);
                        // console.log("add_value", v, e.target.checked, op.values, this.state.keyGen.keyUsage);
                      }
                    } else {
                      if (ofs >= 0) {
                        op.values[ofs] = op.values[op.values.length-1];
                        op.values = op.values.slice(0,-1)
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
    this.state.create_status = "requested";
    this.setState(this.state);
    this.props.channel.send(Message.prepare("CreateKeySet", this.state.keyGen), (error: any) => {
      this.state.create_status = "err("+error+")";
      this.setState(this.state);
    });
  }

  public isGood(valid: boolean) : string {
    return (valid) ? "good" : "unknown"
  }
  public render_password(label :string , key :string , pp :KeyGen.PwPair) : JSX.Element {
    return (
    <div className="six columns {this.isGood(pp.valid())}" >
      <label>{label}:</label><input type="password"
        name={key} required={true}
        className="u-full-width {this.isGood(pp.valid_password())}"
        onChange={(e:any) => {
          pp.password = e.target.value;
          this.setState(this.state);
        }}
      />
    </div>)
  }

  public render_verify_password(label :string , key :string , pp :KeyGen.PwPair) : JSX.Element {
    return (
    <div className="six columns">
      <label>{label}(verify):</label><input type="password"
        name={key+"-verify"} required={true}
        className="u-full-width {this.isGood(pp.valid_verify())}"
        onChange={(e:any) => {
          pp.verify = e.target.value;
          this.setState(this.state);
        }}
      />
    </div>)
  }

  public render_form() : JSX.Element {
    if (!this.state.create) {
        return (<span></span>)
    }
    return (
    <form>
    <div className="row">
    <div className="three columns">
    <label>Key-Type:</label>{this.render_option("keyType", this.state.keyGen.keyType)}
    </div>
    <div className="three columns">
    <label>Master-Key-Length:</label>{this.render_option("masterKeyLength", this.state.keyGen.masterKeyLength)}
    </div>
    <div className="three columns">
    <label>Sub-Key-Length:</label>{this.render_option("subKeyLength", this.state.keyGen.subKeyLength)}
    </div>
    <div className="three columns">
    <label>Key-Usage:</label>{this.render_multioption("keyUsage", this.state.keyGen.keyUsage)}
    </div>
    </div>

    <div className="row">
    <div className="six columns">
    <label>Name-Real:</label><input type="text"
      className="u-full-width {this.isGood(this.state.keyGen.nameReal.valid())}"
      required={true}
      name="nameReal"
      onChange={(e:any) => {
        this.state.keyGen.nameReal.value = e.target.value;
        this.setState(this.state);
      }}
      value={this.state.keyGen.nameReal.value} />
    </div>
    <div className="six columns">
    <label>Name-Email:</label><input type="email"
      className="u-full-width {this.isGood(this.state.keyGen.nameEmail.valid())}"
      autoComplete="on"
      required={true}
      name="nameEmail"
      onChange={(e:any) => {
        this.state.keyGen.nameEmail.value = e.target.value;
        this.setState(this.state);
      }}
      value={this.state.keyGen.nameEmail.value} />
    </div>
    </div>
    <div className="row">
    <div className="nine columns">
      <label>Name-Comment:</label><input type="text"
        className="u-full-width {this.isGood(this.state.keyGen.nameComment.valid())}"
        autoComplete="on"
        required={true}
        name="nameComment"
        onChange={(e:any) => {
          this.state.keyGen.nameComment.value = e.target.value;
          this.setState(this.state);
        }}
        value={this.state.keyGen.nameComment.value} />
    </div>
    <div className="three columns">
    <label>Expire-Date:</label><input type="date" name="expireDate"
      className={this.isGood(this.state.keyGen.expireDate.valid())}
      autoComplete="on"
      required={true}
      min={Date.now()}
      onChange={(e:any) => {
        this.state.keyGen.expireDate.value = new Date(e.target.value);
        this.setState(this.state);
      }}
      defaultValue={KeyGen.format_date(this.state.keyGen.expireDate.value)}
    />
    </div>
    </div>

    <div className="row">
   {this.render_password("Password", "cq-password", this.state.keyGen.password)}
   {this.render_verify_password("Password", "cq-password", this.state.keyGen.password)}
   </div>
    <div className="row">
   {this.render_password("AdminPin", "cq-adminpin", this.state.keyGen.adminPin)}
   {this.render_verify_password("AdminPin", "cq-adminpin", this.state.keyGen.adminPin)}
   </div>
    <div className="row">
   {this.render_password("UserPin", "cq-userpin", this.state.keyGen.userPin)}
   {this.render_verify_password("UserPin", "cq-userpin", this.state.keyGen.userPin)}
   </div>

    <div className="row">
    <div className="four columns">
    </div>
    <div className="four columns">
    <button type="button"
      onClick={this.create_key.bind(this)}
      disabled={this.state.create_status != "create-key" || !this.state.keyGen.valid()}>{this.state.create_status}</button>
   </div>
   </div>
    </form>
    );
      // min={KeyGen.format_date(Date.now())}
      // value={KeyGen.format_date(this.state.keyGen.expireDate)} />
  }


  public render(): JSX.Element {
    return (
      <div className="row CreateKey" >
        <h3 onClick={this.handleCreateClick}>CreateKey</h3>
        {this.render_form()}
      </div>
    );
  }

}

// {this.render_key(sk)}
// <li>
// <ul>
// </ul>
// </li>
// <li>
// <ul>
// {sk.subKeys.map((ssb) => <li key={ssb.key}>{this.render_key(ssb)}</li> )}
// </ul>
// </li>
// </li>)}
