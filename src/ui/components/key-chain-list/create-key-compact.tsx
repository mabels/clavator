import * as React from 'react';
import * as KeyGen from '../../../gpg/key-gen';
import { CreateKeyOption } from './create-key-option';
import { observer } from 'mobx-react';

export interface CreateKeyCompactProps {
  compact: boolean;
  keyGen: KeyGen.KeyGen;
}

export const CreateKeyCompact = observer((props: CreateKeyCompactProps): JSX.Element => {
  if (!props.compact) {
    return null;
  }
  return (
    <div className="row">
      <div className="three columns">
        <label>Master-Key-Length:</label>
        <CreateKeyOption
          name="masterKeyLength"
          ops={[props.keyGen.keyInfo.length]}
        />
      </div>
      <div className="three columns">
        <label>Slave-Key-Length:</label>
        <CreateKeyOption
          name="subkeys.all.length"
          ops={props.keyGen.subKeys.map((sb: KeyGen.KeyInfo, i: number) => {
            return sb.length;
          })}
        />
        )}
      </div>
    </div>
  );
});
