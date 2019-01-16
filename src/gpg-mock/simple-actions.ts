import GpgMockState from './gpg-mock-state';
import * as yargs from 'yargs';

function quickAddKeyAction(y: yargs.Arguments, state: GpgMockState): boolean {
  return y.quickAddkey;
}

function exportSecretKeyAction(
  y: yargs.Arguments,
  state: GpgMockState
): boolean {
  // console.log(y);
  if (y.exportSecretKey) {
    state.stdout('-----BEGIN PGP PRIVATE KEY BLOCK-----');
    return true;
  }
  return false;
}

function exportAction(y: yargs.Arguments, state: GpgMockState): boolean {
  if (y.export) {
    state.stdout('-----BEGIN PGP PUBLIC KEY BLOCK-----');
    return true;
  }
  return false;
}

function exportSshKeyAction(y: yargs.Arguments, state: GpgMockState): boolean {
  if (y.exportSshKey) {
    state.stdout('ssh-rsa wurst kakkak');
    return true;
  }
  return false;
}

function deleteSecretKeyAction(
  y: yargs.Arguments,
  state: GpgMockState
): boolean {
  return y.deleteSecretKey;
}

function deleteKeyAction(y: yargs.Arguments, state: GpgMockState): boolean {
  return y.deleteKey;
}

export function cli(y: yargs.Argv, state: GpgMockState): yargs.Argv {
  state.onParsed(quickAddKeyAction);
  state.onParsed(exportSecretKeyAction);
  state.onParsed(exportAction);
  state.onParsed(exportSshKeyAction);
  state.onParsed(deleteSecretKeyAction);
  state.onParsed(deleteKeyAction);
  return yargs.options({
    'quick-addkey': { describe: 'quick-addkey action', boolean: true },
    'export-secret-key': { describe: 'export secret key', type: 'string' },
    export: { describe: 'export public key', type: 'string' },
    'export-ssh-key': { describe: 'export ssh public key', type: 'string' },
    'delete-secret-key': { describe: 'delete secret key', type: 'string' },
    'delete-key': { describe: 'delete key', type: 'string' }
  });
}
