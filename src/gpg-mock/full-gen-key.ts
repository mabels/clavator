import * as yargs from 'yargs';

import { GpgMockState } from './gpg-mock-state';

function action(y: yargs.Arguments, state: GpgMockState): boolean {
  let match: string = null;
  if (y.fullGenKey && y.batch) {
    match = 'full-gen-key';
  }
  if (y.import) {
    match = 'import';
  }
  if (match) {
    state.stdoutMock(
      match,
      `sec:u:256:22:19B013CF06A4CAFE:1464699940:1622379940::u:::cESCA:::#::ed25519::
fpr:::::::::F36846C4A7DEFD55F492069C19B013CF06A4CAFE:
grp:::::::::75E60BCBF5E25BBBF0E701CD55BC79F4C03BC320:
uid:u::::1488957915::D4B312C2CD42C1C31F1AE693D3FFDA777E6C6EB8::Gpg Test Master <gpg.sock@lodke.gpg>:
ssb:u:2048:1:1219A4D3B5E4B408:1488957918:1646737200:::::esa:::+:::
fpr:::::::::F3827AE392FD41FD2DE756E91219A4D3B5E4B408:
grp:::::::::2687CC68F654889B83EB8B273BF5438CB6B817A2:
ssb:u:2048:1:A411D687A7393AAB:1488957919:1646737200:::::esa:::+:::
fpr:::::::::6C0FE2F5C89A7BEBF05DCF13A411D687A7393AAB:
grp:::::::::6C90A35935E803A9F19DB71C76EDA1C53CA6E3B4:
ssb:u:2048:1:FB05F8FAE6E6E470:1488957920:1646737200:::::esa:::+:::
fpr:::::::::3228ACF3E25FF4CB70DEADE8FB05F8FAE6E6E470:
grp:::::::::A5516054BF25070216663AD255A8FC2DFBB6324B:`
    );
    state.exitCode(0);
    return true;
  }
  return false;
}

export function fullGenKeyCli(y: yargs.Argv, state: GpgMockState): yargs.Argv {
  state.onParsed(action);
  return yargs.option('full-gen-key', {
    describe: 'full-gen-key action',
    boolean: true
  });
}
