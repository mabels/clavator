import GpgMockState from './gpg-mock-state';
import * as yargs from 'yargs';
import { SecretKey, Group, FingerPrint, Uid } from '../gpg/list-secret-keys';
import * as crypto from 'crypto';
import * as uuid from 'node-uuid';
import * as rxme from 'rxme';

class FullGenKeyBatch {
  public static from(lines: string): SecretKey {
    const temp: any = {};
    lines.split(/[\n\r]+/).forEach(line => {
      const matched = line.match(/^([^:]+):\s*(.*)$/);
      if (matched) {
        temp[matched[1]] = matched[2];
      }
    });
    const sk = new SecretKey();
    // sec:u:4096:1:3D5C596A4339474A:1506893401:1664618400::u:::cESCA:::+:::23::0:
    sk.type = 'sec';
    sk.trust = 'u';
    sk.cipher = '4096';
    sk.funky = '1';
    sk.bits = 4096;
    const now = new Date();
    const nid = (new Array(10)).fill(0).map(i => '' + ~~(Math.random() * 10)).join('');
    const kid = crypto.createHash('sha1').update(uuid.v4()).digest('hex').toUpperCase();
    sk.key = kid.slice(-16);
    sk.keyId = nid;
    sk.created = ~~(now.getTime() / 1000);
    sk.expires = ~~((new Date(temp['Expire-Date']).getTime() / 1000));
    sk.uses = ['c', 'E', 'S', 'C', 'A'];
    sk.group = new Group();
    sk.group.grp = crypto.createHash('sha1').update(uuid.v4()).digest('hex').toUpperCase();
    sk.fingerPrint = new FingerPrint();
    sk.fingerPrint.fpr = kid;
    const uid = new Uid();
    uid.id = nid;
    uid.trust = 'u';
    uid.name = temp['Name-Real'];
    uid.email = temp['Name-Email'];
    uid.comment = temp['Name-Comment'];
    uid.created = sk.created;
    uid.key = crypto.createHash('sha1').update(uuid.v4()).digest('hex').toUpperCase();
    sk.uids = [uid];
    sk.subKeys = [];
    return sk;
  }
}

// ;

function action(y: yargs.Arguments, state: GpgMockState): rxme.Observable<boolean> {
  return rxme.Observable.create(rxme.Match.BOOLEAN, (obs: rxme.Observer<boolean>) => {
    let match: string = null;
    if (y.fullGenKey && y.batch) {
      match = 'full-gen-key';
      const stdin: string[] = [];
      process.stdin.on('data', (data) => stdin.push(data));
      process.stdin.on('close', () => {
        const sk = FullGenKeyBatch.from(stdin.join(''));
        state.writeJson(y, `${sk.keyId}.keyStore.json`, sk);
        obs.next(true);
        obs.complete();
      });
      return;
    // }
//     if (y.import) {
//       match = 'import';
//     }
//     if (match) {
//       state.stdoutMock(match, `sec:u:256:22:19B013CF06A4CAFE:1464699940:1622379940::u:::cESCA:::#::ed25519::
// fpr:::::::::F36846C4A7DEFD55F492069C19B013CF06A4CAFE:
// grp:::::::::75E60BCBF5E25BBBF0E701CD55BC79F4C03BC320:
// uid:u::::1488957915::D4B312C2CD42C1C31F1AE693D3FFDA777E6C6EB8::Gpg Test Master <gpg.sock@lodke.gpg>:
// ssb:u:2048:1:1219A4D3B5E4B408:1488957918:1646737200:::::esa:::+:::
// fpr:::::::::F3827AE392FD41FD2DE756E91219A4D3B5E4B408:
// grp:::::::::2687CC68F654889B83EB8B273BF5438CB6B817A2:
// ssb:u:2048:1:A411D687A7393AAB:1488957919:1646737200:::::esa:::+:::
// fpr:::::::::6C0FE2F5C89A7BEBF05DCF13A411D687A7393AAB:
// grp:::::::::6C90A35935E803A9F19DB71C76EDA1C53CA6E3B4:
// ssb:u:2048:1:FB05F8FAE6E6E470:1488957920:1646737200:::::esa:::+:::
// fpr:::::::::3228ACF3E25FF4CB70DEADE8FB05F8FAE6E6E470:
// grp:::::::::A5516054BF25070216663AD255A8FC2DFBB6324B:`
//       );
//       state.exitCode(0);
//       obs.next(true);
    } else {
      obs.next(false);
      obs.complete();
    }
  });
}

export function cli(y: yargs.Argv, state: GpgMockState): yargs.Argv {
  state.onParsed(action);
  return yargs.option('full-gen-key', { describe: 'full-gen-key action', boolean: true });
}
