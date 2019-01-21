
import * as React from 'react';
import { observer } from 'mobx-react';

import { NestedFlag, Warrents, Warrent } from '../../../model';
import { KeyGen, KeyGenUid, SecretKey } from '../../../gpg/types';
import {
  PassPhrase,
  AppState,
  CharFormat
} from '../../model';
import { Message } from '../../../model';
import { CreateKeyForm } from './create-key-form';
import { observable } from 'mobx';

interface CreateKeyProps extends React.Props<CreateKey> {
  readonly appState: AppState;
  readonly compact?: boolean;
  readonly onComplete?: () => void;
  readonly renderSubmit?: (ck: CreateKey) => JSX.Element;
  readonly secretKey?: SecretKey;
  readonly readOnly: NestedFlag;
}

@observer
export class CreateKey extends React.Component<CreateKeyProps, {}> {

  public readonly keyGen: KeyGen;
  public readonly passPhrase: PassPhrase;
  public transaction: Message.Transaction<KeyGen>;

  constructor(props: CreateKeyProps) {
    super(props);
    if (props.secretKey) {
      this.keyGen = props.secretKey.toKeyGen(3);
    } else {
      this.keyGen = KeyGen.withSubKeys(3);
      this.keyGen.uids.add(new KeyGenUid());
    }
    this.passPhrase = PassPhrase.createPerWarrent(
      new Warrents([new Warrent('me')]), [], CharFormat.wildcard(),
      'password error', '', 1);

  }

  public componentWillMount(): void {
    // if (this.props.secretKey) {
    //   console.log('CreateKey:componentWillMount', this.props.secretKey);
    // }
    this.props.appState.channel.onMessage((h: Message.Header, data: string) => {
// console.log('CreateKey:', h, this.state.transaction.header)
      if (this.transaction &&
          this.transaction.header.transaction == h.transaction &&
          h.action == 'CreateKeySet.Completed') {
            let skey = null;
            if (data && this.props.secretKey) {
              this.props.secretKey.jsfill(JSON.parse(data));
            }
            console.log('CreateKey:Matched', h, this.transaction.header, this.props, skey);
            if (this.props.onComplete) {
               this.props.onComplete();
            }
          }
    });
  }

  public render(): JSX.Element {
    return (
      <div className="row CreateKey" >
        <CreateKeyForm
          appState={this.props.appState}
          passPhrase={this.passPhrase}
          createKey={this}
          renderSubmit={this.props.renderSubmit}
          transaction={this.transaction}
          compact={this.props.compact}
          keyGen={this.keyGen}
          readOnly={this.props.readOnly} />
      </div>
    );
  }

}
