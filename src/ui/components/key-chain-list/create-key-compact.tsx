import * as React from 'react';
import { KeyGen, KeyInfo } from '../../../gpg/types';
import { CreateKeyOption } from './create-key-option';
import { observer } from 'mobx-react';

export interface CreateKeyCompactProps {
  compact: boolean;
  keyGen: KeyGen;
}

export const CreateKeyCompact = observer((props: CreateKeyCompactProps): JSX.Element => {
  if (!props.compact) {
    return null;
  }
  return (
    <div className="row">
      <div className="three columns">
        <CreateKeyOption
          title="Master-Key-Length"
          name="masterKeyLength"
          ops={[props.keyGen.keyInfo.length]}
        />
      </div>
      <div className="three columns">
        <CreateKeyOption
          title="Slave-Key-Length"
          name="subkeys.all.length"
          ops={props.keyGen.subKeys.map((sb: KeyInfo, i: number) => {
            return sb.length;
          })}
        />
        )}
      </div>
    </div>
  );
});
