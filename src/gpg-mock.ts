import * as fs from 'fs';
import * as path from 'path';

const processArgv = new Map();
process.argv.forEach((arg, idx) => {
  processArgv.set(arg, idx);
});

function exists(args: string[]): boolean {
  let found = 0;
  args.forEach((a) => {
    if (processArgv.has(a)) {
      found++;
    }
  });
  return found == args.length;
}

function homeDir(): string {
  if (processArgv.has('--homedir')) {
    return process.argv[processArgv.get('--homedir') + 1];
  }
  return '';
}

if (exists(['--list-secret-keys', '--with-colons'])) {
  let mock = path.join(homeDir(), `list-secret-keys.mock`);
  if (homeDir().length && fs.existsSync(mock)) {
    console.log(fs.readFileSync(mock).toString());
  } else {
  console.log(`sec:u:256:22:19B013CF06A4CAFE:1464699940:1622379940::u:::cESCA:::#::ed25519::
fpr:::::::::F36846C4A7DEFD55F492069C19B013CF06A4CAFE:
grp:::::::::75E60BCBF5E25BBBF0E701CD55BC79F4C03BC320:
uid:u::::1464699940::A319A573075CF1606705BDA9FD5F07E5AD24F257::Meno Abels <meno.abels@adviser.com>:
ssb:u:256:22:258DE0ECF59BF6FC:1464700731:1622380731:::::a:::#::ed25519:
fpr:::::::::C0C19A85335B5E87EC3FB6E2258DE0ECF59BF6FC:
grp:::::::::1A7331A68D82EED9D71C6D79D0FC78BEA3BC6368:
ssb:u:4096:1:28E66F405F1BE34D:1464700773:1622380773:::::esa:::D2760001240102010006041775630000:::
fpr:::::::::2D32339F24A537406437181A28E66F405F1BE34D:
grp:::::::::C083EC516CCEEFE80403CCA7CC3782A017C99142:
ssb:u:4096:1:060FF53CB3A32992:1465218501:1622898501:::::es:::D2760001240102010006041775630000:::
fpr:::::::::F78D5B547A9BB0E8A174C0F5060FF53CB3A32992:
grp:::::::::EC5F333359383F725488E7DEC8B289EC521E5F39:
ssb:u:4096:1:3D851A5DF09DEB9C:1465218921:1622898921:::::es:::D2760001240102010006041775630000:::
fpr:::::::::B3B94966DF73077EFA734EC83D851A5DF09DEB9C:
grp:::::::::2DC62D282D308E58A8C7C4F7652955AC146860D2:
sec:u:4096:1:813AB5C72CFC6469:1488957915:1646737200::u:::cESCA:::+::::
fpr:::::::::3A721BF56A77364C62AC93C3813AB5C72CFC6469:
grp:::::::::4A2481F42E2F9EC3913C08201F907640F3DEA647:
uid:u::::1488957915::D4B312C2CD42C1C31F1AE693D3FFDA777E6C6EB8::Meno Abels <meno@abels.name>:
ssb:u:2048:1:1219A4D3B5E4B408:1488957918:1646737200:::::esa:::+:::
fpr:::::::::F3827AE392FD41FD2DE756E91219A4D3B5E4B408:
grp:::::::::2687CC68F654889B83EB8B273BF5438CB6B817A2:
ssb:u:2048:1:A411D687A7393AAB:1488957919:1646737200:::::esa:::+:::
fpr:::::::::6C0FE2F5C89A7BEBF05DCF13A411D687A7393AAB:
grp:::::::::6C90A35935E803A9F19DB71C76EDA1C53CA6E3B4:
ssb:u:2048:1:FB05F8FAE6E6E470:1488957920:1646737200:::::esa:::+:::
fpr:::::::::3228ACF3E25FF4CB70DEADE8FB05F8FAE6E6E470:
grp:::::::::A5516054BF25070216663AD255A8FC2DFBB6324B:`);
  }
  process.exit(0);
} else if (exists(['--full-gen-key', '--batch']) || exists(['--import'])) {
  if (homeDir().length) {
    fs.writeFileSync(path.join(homeDir(), `list-secret-keys.mock`),
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
  }
  process.exit(0);
} else if (exists(['--quick-addkey'])) {
  process.exit(0);
} else if (exists(['--export-secret-key'])) {
  console.log('-----BEGIN PGP PRIVATE KEY BLOCK-----');
  process.exit(0);
} else if (exists(['--export'])) {
  console.log('-----BEGIN PGP PUBLIC KEY BLOCK-----');
  process.exit(0);
} else if (exists(['--export-ssh-key'])) {
  console.log('ssh-rsa wurst kakkak');
  process.exit(0);
} else if (exists(['--delete-secret-key'])) {
  process.exit(0);
} else if (exists(['--delete-key'])) {
  if (homeDir().length) {
    fs.writeFileSync(path.join(homeDir(), `list-secret-keys.mock`), '');
  }
  process.exit(0);
} else if (exists(['GETINFO socket_name', '/bye'])) {
  console.log(`D ${path.join(homeDir(), 'S.gpg-agent-' + Math.random())}`);
  console.log('OK');
  process.exit(0);
} else if (exists(['killagent', '/bye'])) {
  console.log('OK closing connection');
  process.exit(0);
} else if (exists(['--card-status', '--with-colons'])) {
  console.log([`Reader:1050:0405:X:0:AID:D2760001240102010006041775630000:openpgp-card:
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
`].join(''));
  process.exit(0);
} else {
  fs.appendFileSync('/tmp/gpg-mock.log', [process.execPath, process.argv].join(',') + '\n');
  let data: string[] = [];
  process.stdin.on('data', (a: any) => data.push(a.toString()));
  process.stdin.on('error', () => {
    fs.appendFileSync('/tmp/gpg-mock.log', [process.execPath, process.argv].join(',') + '\n');
    process.exit(28);
  });
  process.stdin.on('end', () => {
    fs.appendFileSync('/tmp/gpg-mock.log', [process.execPath, process.argv].join(',') + '\n{' + data.join('\n') + '}');
    process.exit(29);
  });
}
