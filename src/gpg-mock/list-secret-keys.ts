import GpgMockState from './gpg-mock-state';
import * as yargs from 'yargs';
import * as rxme from 'rxme';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { SecretKey, Group, FingerPrint, Uid } from '../gpg/list-secret-keys';

function listSecretKeys(state: GpgMockState, obs: rxme.Observer, matches: string[], idx: number): void {
  if (idx >= matches.length) {
    state.exitCode(0);
    obs.next(rxme.Msg.True());
    obs.complete();
  }
  // console.log(matches[idx]);
  fs.readFile(matches[idx], (err, data) => {
    const sk = SecretKey.jsfill(JSON.parse(data.toString('utf8')));
    console.log(sk.asGpgWithColons());
    listSecretKeys(state, obs, matches, idx + 1);
  });
}

function action(y: yargs.Arguments, state: GpgMockState): rxme.Observable {
  return rxme.Observable.create(obs => {
    if (y.listSecretKeys && y.withColons) {
      // console.log('dxxx', y, y.listSecretKeys, y.withColons);
      glob(path.join(y.homedir, '*.keyStore.json'), {}, (err, matches) => {
        listSecretKeys(state, obs, matches, 0);
      });
      // state.stdoutMock('list-secrect-keys',
      // `sec:-:2048:1:1A5D93796CF70ADF:1333149072:1493647783::-:::escaESCA:::+::::
      // fpr:::::::::547484819BCCDBDA0E73858F1A5D93796CF70ADF:
      // grp:::::::::71AA10F2E9194FF66E3FD4AE883B4CB9180CF977:
      // uid:-::::1462111783::A319A573075CF1606705BDA9FD5F07E5AD24F257::Meno Abels <meno.abels@adviser.com>:::::::::
      // ssb:-:2048:1:0212004AF9FC8C5A:1333149072:1493647841:::::esa:::+:::
      // fpr:::::::::6E7D140786ED43EC1976080E0212004AF9FC8C5A:
      // grp:::::::::CF22205D70DB384DE25ACC1AAE7E918C15C1533E:
      // sec:u:2048:1:23C4790FEF6E173F:1373320318:1499550718::u:::escaESCA:::+::::
      // fpr:::::::::F999B66D68B825CEBEEB891123C4790FEF6E173F:
      // grp:::::::::32DA7F8296F405671974350221776EA82B9388B0:
      // uid:u::::1373320318::30F624F6E100EA83E90DDF2056DDABF6C25775AC::
      // Meno Abels <meno.abels@sinnerschrader.com>:::::::::
      // ssb:u:2048:1:2E64ABA4FFB43774:1373320318:1499550718:::::esa:::+:::
      // fpr:::::::::CC8A8119FE0AEEB69FF8B9682E64ABA4FFB43774:
      // grp:::::::::2A1585647A39DC23748C16CE2692896C139768C1:
      // sec:u:256:22:19B013CF06A4BEEF:1464699940:1622379940::u:::cESCA:::#::ed25519::
      // fpr:::::::::F36846C4A7DEFD55F492069C19B013CF06A4BEEF:
      // grp:::::::::75E60BCBF5E25BBBF0E701CD55BC79F4C03BC320:
      // uid:u::::1464699940::A319A573075CF1606705BDA9FD5F07E5AD24F257::Meno Abels <meno.abels@adviser.com>:::::::::
      // ssb:u:4096:1:28E66F405F1BE34D:1464700773:1622380773:::::esa:::D2760001240102010006041775630000:::
      // fpr:::::::::2D32339F24A537406437181A28E66F405F1BE34D:
      // grp:::::::::C083EC516CCEEFE80403CCA7CC3782A017C99142:
      // ssb:u:4096:1:060FF53CB3A32992:1465218501:1622898501:::::es:::D2760001240102010006041775630000:::
      // fpr:::::::::F78D5B547A9BB0E8A174C0F5060FF53CB3A32992:
      // grp:::::::::EC5F333359383F725488E7DEC8B289EC521E5F39:
      // ssb:u:4096:1:3D851A5DF09DEB9C:1465218921:1622898921:::::es:::D2760001240102010006041775630000:::
      // fpr:::::::::B3B94966DF73077EFA734EC83D851A5DF09DEB9C:
      // grp:::::::::2DC62D282D308E58A8C7C4F7652955AC146860D2:`);
    } else {
      obs.next(rxme.Msg.False());
      obs.complete();
    }
  });
}

export function cli(y: yargs.Argv, state: GpgMockState): yargs.Argv {
  state.onParsed(action);
  return yargs.option('list-secret-keys', { describe: 'list secret keys', boolean: true });
}
