import * as yargs from 'yargs';
import { GpgMockState } from './gpg-mock-state';

function action(y: yargs.Arguments, state: GpgMockState): boolean {
  if (y.cardStatus && y.withColons) {
    state.stdoutMock(
      'card-status-with-colons',
      [
        `Reader:1050:0405:X:0:AID:D2760001240102010006041775630000:openpgp-card:
version:0201:
vendor:0006:Yubico:
serial:04178493:
name:Clavator:San:
lang:en:
sex:m:
url::
login:abels:
forcepin:1:::
keyattr:1:1:4096:
keyattr:2:1:4096:
keyattr:3:1:4096:
maxpinlen:127:127:127:
pinretry:3:0:3:
sigcount:174:::
cafpr::::
fpr:F78D5B547A9BB0E8A174C0F5060FF53CB3ACAFEE:B3BCAFEEF73077EFA734EC83D851CAFFEEDEB9C`,
        `:2D32339394392AF437181A28E66F405F1BE34D:\n`,
        `fprtime:1465218201:1465218221:1464700783:
`
      ].join('')
    );
    state.exitCode(0);
    return true;
  }
  return false;
}

export function cardStatusCli(y: yargs.Argv, state: GpgMockState): yargs.Argv {
  state.onParsed(action);
  return y.option('card-status', {
    describe: 'card status output',
    boolean: true
  });
}
