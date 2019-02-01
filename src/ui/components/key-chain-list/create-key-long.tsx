import * as React from 'react';
import { observer } from 'mobx-react';

import { KeyGen, KeyInfo } from '../../../gpg/types';
import { CreateKeyOption } from './create-key-option';
import { CreateKeyMultioption } from './create-key-multioption';
import { FormControl, FormLabel } from '@material-ui/core';

export interface CreateKeyLongProps {
  readonly compact: boolean;
  readonly keyGen: KeyGen;
}

export const CreateKeyLong = observer(
  (props: CreateKeyLongProps): JSX.Element => {
    if (props.compact) {
      return null;
    }
    return (
      <>
        <FormControl>
          <FormLabel>Masterkey Params</FormLabel>
          <CreateKeyOption
            title="Key-Type"
            name="keyType"
            ops={[props.keyGen.keyInfo.type]}
          />
          <CreateKeyOption
            title="Master-Key-Length"
            name="masterKeyLength"
            ops={[props.keyGen.keyInfo.length]}
          />
          <CreateKeyMultioption
            title="Key-Usage"
            name="keyUsage"
            op={props.keyGen.keyInfo.usage}
          />
        </FormControl>

        {props.keyGen.subKeys.map((sb: KeyInfo, i: number) => {
          return (
            <FormControl key={i}>
              <FormLabel>SubKey {i} Params</FormLabel>
              <CreateKeyOption
                key={'key-type.' + i}
                title="Key-Type"
                name={'subkeys.' + i + '.keyType'}
                ops={[sb.type]}
              />
              <CreateKeyOption
                key={'key-length.' + i}
                title="Key-Length"
                name={'subkeys.' + i + '.length'}
                ops={[sb.length]}
              />
              <CreateKeyMultioption
                key={'key-usage.' + i}
                title="Key-Usage"
                name={'subkeys.' + i + '.usage'}
                op={sb.usage}
              />
            </FormControl>
          );
        })}
      </>
    );
  }
);
