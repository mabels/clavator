import * as yargs from 'yargs';
import { GpgMockState } from './gpg-mock-state';
import { listSecretKeysCli } from './list-secret-keys';
import { fullGenKeyCli } from './full-gen-key';
import { simpleActionsCli } from './simple-actions';
import { agentCli } from './agent';
import { cardStatusCli } from './card-status';

export function gpgMockCli(args: string[]): void {
  const state = GpgMockState.create();
  let y = yargs.usage('$0 <cmd> [args]');
  y = y.options({
    'with-colons': { describe: 'output in colons format', boolean: true },
    batch: { describe: 'no interactive processing', boolean: true },
    import: { describe: 'import key from stdin', boolean: true },
    homedir: { describe: 'the gpg database base directory', type: 'string' },
    'passphrase-fd': { describe: 'positional fd inputs', type: 'array' },
    version: { describe: 'prints version', boolean: true }
  });
  state.onParsed(
    (_y: yargs.Arguments, _state: GpgMockState): boolean => {
      if (_y.version) {
        // const version = fs.readFileSync('./')
        _state.stdout('gpg-mock (2.1.14)');
        return true;
      }
      return false;
    }
  );
  y = listSecretKeysCli(y, state);
  y = fullGenKeyCli(y, state);
  y = simpleActionsCli(y, state);
  y = agentCli(y, state);
  y = cardStatusCli(y, state);
  y = y.help().showHelpOnFail(true);
  y.parse(args.slice(2), (err: any, argv: yargs.Arguments, output: any) => {
    state.parsed(argv);
  });
}
