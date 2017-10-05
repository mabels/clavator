
import { assert } from 'chai';

import * as Gpg from '../../src/gpg/gpg';
import * as fs from 'fs';
import * as uuid from 'node-uuid';

import * as path from 'path';

import * as ListSecretKeys from '../../src/gpg/list_secret_keys';

import * as KeyGen from '../../src/gpg/key-gen';

import * as Rimraf from 'rimraf';

import { RequestAscii } from '../../src/gpg/request_ascii';
import KeyToYubiKey from '../../src/gpg/key-to-yubikey';

function expireDate(): Date {
  let now = new Date();
  now.setFullYear(now.getFullYear() + 5);
  return now;
}

function keyGen(): KeyGen.KeyGen {
  let keygen = new KeyGen.KeyGen();
  keygen.expireDate.value = expireDate();
  keygen.password.password = 'Gpg Test Jojo Akzu Luso';
  let keyInfo = new KeyGen.KeyInfo();
  keyInfo.type.value = 'RSA';
  keyInfo.usage.values = ['sign', 'encr', 'auth'];
  keygen.subKeys.add(keyInfo);
  let uid = new KeyGen.Uid();
  uid.email.value = 'gpg.sock@lodke.gpg';
  uid.name.value = 'Gpg Test Master';
  keygen.uids.add(uid);
  return keygen;
}

function createMasterKey(gpg: Gpg.Gpg, cb: (res: Gpg.Result) => void): void {
  gpg.createMasterKey(keyGen(), cb);
}

describe('Gpg', () => {
  let gpg: Gpg.Gpg;
  let key: ListSecretKeys.SecretKey;

  before(function (done: any): void {
    gpg = new Gpg.Gpg();
    // console.log('>>>>>', process.argv, process.execPath);
    let cmd = [process.execPath, path.join(
       path.dirname(process.argv[process.argv.length - 1]), 'gpg-mock.js')];
    let cmdAgent = cmd.concat(['AGENT']);
    if (fs.existsSync('/usr/local/bin/gpg2')) {
      cmd = ['/usr/local/bin/gpg2'];
      cmdAgent = ['/usr/local/bin/gpg-connect-agent'];
    }
    if (fs.existsSync('../gpg/gnupg/g10/gpg')) {
      cmd = ['../gpg/gnupg/g10/gpg'];
      cmdAgent = ['../gpg/gnupg/tools/gpg-connect-agent'];
    }
    if (fs.existsSync('/gnupg/g10/gpg')) {
      cmd = ['/gnupg/g10/gpg'];
      cmdAgent = ['/gnupg/tools/gpg-connect-agent'];
    }
    gpg.setGpgCmd(cmd);
    gpg.setGpgAgentCmd(cmdAgent);

    let homedir = path.join(process.cwd(), `${uuid.v4().toString().slice(0, 16)}.tdir`);
    gpg.setHomeDir(homedir);
    fs.mkdirSync(homedir);

    this.timeout(100000);
    // console.log('============');
    createMasterKey(gpg, (res: Gpg.Result) => {
      assert.equal(0, res.exitCode);
      // console.log('------------', res);
      gpg.list_secret_keys((err: string, keys: ListSecretKeys.SecretKey[]) => {
        assert.isNull(err);
        let uid = keys[0].uids[0];
        assert.equal(uid.name, 'Gpg Test Master');
        assert.equal(uid.email, 'gpg.sock@lodke.gpg');
        key = keys[0];
        // console.log('=========', keyGen().subKeys.pallets[0]);
        gpg.createSubkey(key.fingerPrint.fpr, keyGen(),
          keyGen().subKeys.first(), (_res: Gpg.Result) => {
            console.log(`Use GPG ${cmd}:${homedir}:${key.keyId}`);
            assert.equal(0, _res.exitCode);
            done();
          });
      });
    });
  });

  after((done) => {
    gpg.deleteSecretKey(key.fingerPrint.fpr, (res: Gpg.Result) => {
      assert.equal(res.exitCode, 0, 'delete secret key');
      gpg.deletePublicKey(key.fingerPrint.fpr, (_res: Gpg.Result) => {
        assert.equal(_res.exitCode, 0, 'delete pub key');
        gpg.list_secret_keys((err: string, keys: ListSecretKeys.SecretKey[]) => {
          assert.equal(keys.length, 0);
          gpg.runAgent(['killagent', '/bye'], null, (__res: Gpg.Result) => {
            Rimraf.sync(gpg.homeDir);
            done();
          });
        });
      });
    });
  });

  //    public createSubkey(fpr: string, kg: KeyGen.KeyGen, ki: KeyGen.KeyInfo, cb: (res: Result) => void) {
  //     // gpg2  --quick-addkey  FDCF2566BA8134E3BAD15B7DDDC4941118503075 rsa2048 sign,auth,encr
  //     // '--enable-large-rsa'
  //     let args = [
  //       '--no-tty', '--pinentry-mode', 'loopback',
  //       '--passphrase-fd',
  //       () => {
  //         return kg.password.password
  //       },
  //       '--quick-addkey', fpr,
  //       ki.type.value.toLowerCase()+ki.length.value, ki.usage.values.join(','),
  //       KeyGen.format_date(kg.expireDate.value)
  //     ];
  //     console.log('createSubkey', args);
  //     this.run(args, null, cb);
  //   }
  // })

  // it('deleteSecretKey', () => {
  //   gpg.deleteSecretKey(fingerPrint, (res: Gpg.Result) => {
  //   })
  // })

  // it('deletePublicKey', () => {
  //   gpg.deletePublicKey(fingerPrint, (res: Gpg.Result) => {
  //     this.run(['--batch', '--yes', '--delete-key', fingerPrint], null, cb);
  //   })
  // })

  it('prepareToYubiKey', function (done: any): void {
    this.timeout(100000);
    let kytk = new KeyToYubiKey();
    kytk.fingerprint = key.keyId;
    kytk.passphrase.value = 'Gpg Test Jojo Akzu Luso';
    gpg.prepareKeyToYubiKey(kytk, (mygpg: Gpg.Gpg, res: Gpg.Result) => {
      assert.equal(0, res.exitCode, `unknown exit code ${res.stdErr}`);
      assert.isNotNull(mygpg, 'Gpg should be set');
      mygpg.list_secret_keys((err: string, keys: ListSecretKeys.SecretKey[]) => {
        assert.equal(1, keys.length, 'len should be one');
        assert.equal('gpg.sock@lodke.gpg', keys[0].uids[0].email);
        // mygpg.runAgent(['killagent', '/bye'], null, (res: Gpg.Result) => {
        //   done()
        // })
        Rimraf.sync(mygpg.homeDir);
        done();
      });
    });
  });

  it('getSocketName', (done) => {
    gpg.getSocketName((s) => {
      assert.isNotNull(s);
      assert.ok(s.length > 0);
      // console.log('getSocketName:', s);
      done();
    });
  });

  it('pemPrivateKey', function (done: any): void {
    // this.timeout(10000);
    let rqa: RequestAscii = new RequestAscii();
    rqa.fingerprint = key.keyId;
    rqa.passphrase.value = 'Gpg Test Jojo Akzu Luso';
    gpg.pemPrivateKey(rqa, (res: Gpg.Result) => {
      assert.equal(true, res.stdOut.startsWith('-----BEGIN PGP PRIVATE KEY BLOCK-----'), res.stdOut);
      done();
    });
  });

  it('pemPublicKey', (done) => {
    let rqa: RequestAscii = new RequestAscii();
    rqa.fingerprint = key.keyId;
    gpg.pemPublicKey(rqa, (res: Gpg.Result) => {
      assert.equal(true, res.stdOut.startsWith('-----BEGIN PGP PUBLIC KEY BLOCK-----'), res.stdOut);
      done();
    });
  });

  // it('pemRevocation', (done) => {
  //   let rqa : RequestAscii = new RequestAscii();
  //   rqa.fingerprint = key.keyId;
  //   gpg.pemRevocation(rqa, (res: Gpg.Result) => {
  //     assert.equal(true, res.stdOut.startsWith('-----BEGIN PGP PUBLIC KEY BLOCK-----'), res.stdOut)
  //     done();
  //   })
  // })

  it('sshPublic', (done) => {
    let rqa: RequestAscii = new RequestAscii();
    rqa.fingerprint = key.keyId;
    gpg.sshPublic(rqa, (res: Gpg.Result) => {
      // console.log(res);
      assert.equal(true, res.stdOut.startsWith('ssh-rsa '), res.stdOut);
      done();
    });
  });

});
