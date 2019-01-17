
import * as React from 'react';
import classnames from 'classnames';
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
import { AppState } from '../../model/app-state';
import { CreateKeyForm } from './create-key-form';
import { observer } from 'mobx-react';

interface CreateKeyProps extends React.Props<CreateKey> {
  readonly appState: AppState;
  readonly compact?: boolean;
  readonly onComplete?: () => void;
  readonly renderSubmit?: (ck: CreateKey) => JSX.Element;
  readonly secretKey?: ListSecretKeys.SecretKey;
  readonly readOnly: NestedFlag;
}

interface CreateKeyState {
  readonly createDialog: boolean;
  readonly completed: boolean;
  readonly keyGen: KeyGen.KeyGen;
  readonly create_status: string;
  readonly transaction: Message.Transaction<KeyGen.KeyGen>;
  readonly passPhrase: PassPhrase;
}

@observer
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

  public render(): JSX.Element {
    return (
      <div className="row CreateKey" >
        <CreateKeyForm keyGen={this.state.keyGen} readOnly={this.props.readOnly} />
      </div>
    );
  }

}
