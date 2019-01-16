import * as React from 'react';
import * as KeyGen from '../../../gpg/key-gen';
import { CreateKeyOption } from './create-key-option';
import { CreateKeyMultioption } from './create-key-multioption';
import { observer } from 'mobx-react';

export interface CreateKeyLongProps {
  readonly compact: boolean;
  readonly keyGen: KeyGen.KeyGen;
}

export const CreateKeyLong = observer((props: CreateKeyLongProps): JSX.Element => {
  if (props.compact) {
    return null;
  }
  return (
    <div>
      <div className="row">
        <div className="two columns">MasterKey</div>
        <div className="three columns">
          <label>Key-Type:</label>
          <CreateKeyOption
            name="keyType"
            ops={[props.keyGen.keyInfo.type]}
           />
        </div>
        <div className="three columns">
          <label>Master-Key-Length:</label>
          <CreateKeyOption
            name="masterKeyLength"
            ops={[props.keyGen.keyInfo.length]} />
        </div>
        <div className="three columns">
          <label>Key-Usage:</label>
          <CreateKeyMultioption
            name="keyUsage"
            op={props.keyGen.keyInfo.usage} />
        </div>
      </div>

      {props.keyGen.subKeys.map((sb: KeyGen.KeyInfo, i: number) => {
        return (
          <div className="row" key={i}>
            <div className="two columns">SubKey {i}</div>
            <div className="three columns">
              <label>Key-Type:</label>
              <CreateKeyOption
                name={'subkeys.' + i + '.keyType'}
                op={[sb.type]}
                />
            </div>
            <div className="three columns">
              <label>Key-Length:</label>
              <CreateKeyOption
                name={'subkeys.' + i + '.length'}
                op={[sb.length]}
                />
            </div>
            <div className="three columns">
              <label>Key-Usage:</label>
              <CreateKeyMultioption
                name={'subkeys.' + i + '.usage'}
                op={sb.usage}
                />
            </div>
          </div>
        );
      })}
    </div>
  );
});
