import * as React from 'react';
import { observer } from 'mobx-react';

import { KeyGen, KeyInfo } from '../../../gpg/types';
import { CreateKeyOption } from './create-key-option';
import { CreateKeyMultioption } from './create-key-multioption';

export interface CreateKeyLongProps {
  readonly compact: boolean;
  readonly keyGen: KeyGen;
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
          <CreateKeyOption
            title="Key-Type"
            name="keyType"
            ops={[props.keyGen.keyInfo.type]}
           />
        </div>
        <div className="three columns">
          <CreateKeyOption
            title="Master-Key-Length"
            name="masterKeyLength"
            ops={[props.keyGen.keyInfo.length]} />
        </div>
        <div className="three columns">
          <CreateKeyMultioption
            title="Key-Usage"
            name="keyUsage"
            op={props.keyGen.keyInfo.usage} />
        </div>
      </div>

      {props.keyGen.subKeys.map((sb: KeyInfo, i: number) => {
        return (
          <div className="row" key={i}>
            <div className="two columns">SubKey {i}</div>
            <div className="three columns">
              <label>Key-Type:</label>
              <CreateKeyOption
                name={'subkeys.' + i + '.keyType'}
                ops={[sb.type]}
                />
            </div>
            <div className="three columns">
              <label>Key-Length:</label>
              <CreateKeyOption
                name={'subkeys.' + i + '.length'}
                ops={[sb.length]}
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
