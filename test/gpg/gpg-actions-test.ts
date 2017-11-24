
import { assert } from 'chai';

import * as Gpg from '../../src/gpg/gpg';
import { Result } from '../../src/gpg/result';

import * as ListSecretKeys from '../../src/gpg/list-secret-keys';

import KeyGenUid from '../../src/gpg/key-gen-uid';
import { KeyGen, KeyInfo } from '../../src/gpg/key-gen';

import * as Rimraf from 'rimraf';

import { RequestAscii } from '../../src/model/request-ascii';
import KeyToYubiKey from '../../src/gpg/key-to-yubikey';
// import { findDOMNode } from 'react-dom';
// import { dirname } from 'path';

function expireDate(): Date {
  let now = new Date();
  now.setFullYear(now.getFullYear() + 5);
  return now;
}

function keyGen(): KeyGen {
  let keygen = new KeyGen();
  keygen.expireDate.value = expireDate();
  keygen.password.value = 'Gpg Test Jojo Akzu Luso';
  let keyInfo = new KeyInfo();
  keyInfo.type.value = 'RSA';
  keyInfo.usage.values = ['sign', 'encr', 'auth'];
  keygen.subKeys.add(keyInfo);
  let uid = new KeyGenUid();
  uid.email.value = 'gpg.sock@lodke.gpg';
  uid.name.value = 'Gpg Test Master';
  keygen.uids.add(uid);
  return keygen;
}

function createMasterKey(gpg: Gpg.Gpg, cb: (res: Result) => void): void {
  gpg.createMasterKey(keyGen(), cb);
}

describe('Gpg', () => {
  let gpg: Gpg.Gpg;
  let key: ListSecretKeys.SecretKey;

  before(async function (): Promise<void> {
    this.timeout(100000);
    return new Promise<void>(async (resolve, rej) => {
      try {
        gpg = await Gpg.createTest();
        // console.log('============');
        createMasterKey(gpg, (res: Result) => {
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
              keyGen().subKeys.first(), (_res: Result) => {
                console.log(`Use GPG ${_res.gpg.getGpgCmd()}:${_res.gpg.homeDir}:${key.keyId}`);
                assert.equal(0, _res.exitCode);
                resolve();
              });
          });
        });
      } catch (e) {
        rej(e);
      }
    });
  });

  after((done) => {
    gpg.deleteSecretKey(key.fingerPrint.fpr, (res: Result) => {
      assert.equal(res.exitCode, 0, 'delete secret key');
      gpg.deletePublicKey(key.fingerPrint.fpr, (_res: Result) => {
        assert.equal(_res.exitCode, 0, 'delete pub key');
        gpg.list_secret_keys((err: string, keys: ListSecretKeys.SecretKey[]) => {
          assert.equal(keys.length, 0);
          gpg.runAgent(['killagent', '/bye'], null, (__res: Result) => {
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
  //   gpg.deleteSecretKey(fingerPrint, (res: Result) => {
  //   })
  // })

  // it('deletePublicKey', () => {
  //   gpg.deletePublicKey(fingerPrint, (res: Result) => {
  //     this.run(['--batch', '--yes', '--delete-key', fingerPrint], null, cb);
  //   })
  // })

  it('prepareToYubiKey', function (done: any): void {
    this.timeout(100000);
    let kytk = new KeyToYubiKey();
    kytk.fingerprint = key.keyId;
    kytk.passphrase.value = 'Gpg Test Jojo Akzu Luso';
    gpg.prepareKeyToYubiKey(kytk, (mygpg: Gpg.Gpg, res: Result) => {
      assert.equal(0, res.exitCode, `unknown exit code ${res.stdErr}`);
      assert.isNotNull(mygpg, 'Gpg should be set');
      mygpg.list_secret_keys((err: string, keys: ListSecretKeys.SecretKey[]) => {
        assert.equal(1, keys.length, 'len should be one');
        assert.equal('gpg.sock@lodke.gpg', keys[0].uids[0].email);
        // mygpg.runAgent(['killagent', '/bye'], null, (res: Result) => {
        //   done()
        // })
        Rimraf.sync(mygpg.homeDir);
        done();
      });
    });
  });

  it('keyToSmartCard with Mock', function (done: any): void {
    this.timeout(100000);
    const mygpg = gpg.useMock();
    let kytk = new KeyToYubiKey();
    kytk.fingerprint = key.keyId;
    kytk.passphrase.value = 'Gpg Test Jojo Akzu Luso';
    kytk.admin_pin.pin = '12345678';
    kytk.card_id = 'Smarte-Karte';
    kytk.slot_id = 4711;
    mygpg.keyToYubiKey(kytk, (res: Result) => {
      assert.equal(0, res.exitCode, `unknown exit code ${res.stdErr}`);
      assert.equal(res.execTransaction.data.readFds[0].value, `${kytk.passphrase.value}\n`);
      assert.equal(res.execTransaction.data.readFds[1].value, `${kytk.admin_pin.pin}\n`);
      // console.log(res.execTransaction.data);
      done();
    });
  });

  it('getSocketName', (done) => {
    gpg.useMock().getSocketName((s: string) => {
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
    gpg.useMock().pemPrivateKey(rqa, (res: Result) => {
      assert.equal(true, res.stdOut.startsWith('-----BEGIN PGP PRIVATE KEY BLOCK-----'), res.stdOut);
      done();
    });
  });

  it('pemPublicKey', (done) => {
    let rqa: RequestAscii = new RequestAscii();
    rqa.fingerprint = key.keyId;
    gpg.useMock().pemPublicKey(rqa, (res: Result) => {
      assert.equal(true, res.stdOut.startsWith('-----BEGIN PGP PUBLIC KEY BLOCK-----'), res.stdOut);
      done();
    });
  });

  // it('pemRevocation', (done) => {
  //   let rqa : RequestAscii = new RequestAscii();
  //   rqa.fingerprint = key.keyId;
  //   gpg.pemRevocation(rqa, (res: Result) => {
  //     assert.equal(true, res.stdOut.startsWith('-----BEGIN PGP PUBLIC KEY BLOCK-----'), res.stdOut)
  //     done();
  //   })
  // })

  it('sshPublic', (done) => {
    let rqa: RequestAscii = new RequestAscii();
    rqa.fingerprint = key.keyId;
    gpg.useMock().sshPublic(rqa, (res: Result) => {
      // console.log(res);
      assert.equal(true, res.stdOut.startsWith('ssh-rsa '), res.stdOut);
      done();
    });
  });

});
