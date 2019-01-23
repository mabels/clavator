
import { assert } from 'chai';
import * as Rimraf from 'rimraf';

import { Result, Gpg, createTest } from '../../src/gpg';

import {
  KeyGenUid,
  KeyGen,
  KeyInfo,
  KeyToYubiKey,
  SecretKey
} from '../../src/gpg/types';

import { RequestAscii } from '../../src/model';
// import { findDOMNode } from 'react-dom';
// import { dirname } from 'path';

function expireDate(): Date {
  const now = new Date();
  now.setFullYear(now.getFullYear() + 5);
  return now;
}

function keyGen(): KeyGen {
  let keygen = new KeyGen();
  keygen.expireDate._value.set(expireDate());
  keygen.password._value.set('Gpg Test Jojo Akzu Luso');
  let keyInfo = new KeyInfo();
  keyInfo.type._value.set('RSA');
  keyInfo.usage.values.replace(['sign', 'encr', 'auth']);
  keygen.subKeys.add(keyInfo);
  let uid = new KeyGenUid();
  uid.email._value.set('gpg.sock@lodke.gpg');
  uid.name._value.set('Gpg Test Master');
  keygen.uids.add(uid);
  return keygen;
}

function createMasterKey(gpg: Gpg, cb: (res: Result) => void): void {
  gpg.createMasterKey(keyGen(), cb);
}

describe('Gpg', () => {
  let gpg: Gpg;
  let key: SecretKey;

  beforeAll(async function (): Promise<void> {
    return new Promise<void>(async (resolve, rej) => {
      try {
        gpg = await createTest();
        // console.log('============', gpg.info());
        createMasterKey(gpg, (res: Result) => {
          // console.log('------------', res);
          assert.equal(0, res.exitCode);
          gpg.list_secret_keys((err: string, keys: SecretKey[]) => {
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
  }, 10000);

  afterAll((done) => {
    gpg.deleteSecretKey(key.fingerPrint.fpr, (res: Result) => {
      assert.equal(res.exitCode, 0, 'delete secret key');
      gpg.deletePublicKey(key.fingerPrint.fpr, (_res: Result) => {
        assert.equal(_res.exitCode, 0, 'delete pub key');
        gpg.list_secret_keys((err: string, keys: SecretKey[]) => {
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
    // this.timeout(100000);
    let kytk = new KeyToYubiKey();
    kytk._fingerprint.set(key.keyId);
    kytk.passphrase._value.set('Gpg Test Jojo Akzu Luso');
    gpg.prepareKeyToYubiKey(kytk, (mygpg: Gpg, res: Result) => {
      assert.equal(0, res.exitCode, `unknown exit code ${res.stdErr}`);
      assert.isNotNull(mygpg, 'Gpg should be set');
      mygpg.list_secret_keys((err: string, keys: SecretKey[]) => {
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
    // this.timeout(100000);
    const mygpg = gpg.useMock();
    let kytk = new KeyToYubiKey();
    kytk._fingerprint.set(key.keyId);
    kytk.passphrase._value.set('Gpg Test Jojo Akzu Luso');
    kytk.admin_pin._pin.set('12345678');
    kytk._card_id.set('Smarte-Karte');
    kytk._slot_id.set(4711);
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
    const rqa: RequestAscii = new RequestAscii({
      fingerprint: key.keyId
    });
    rqa.passphrase._value.set('Gpg Test Jojo Akzu Luso');
    gpg.useMock().pemPrivateKey(rqa, (res: Result) => {
      assert.equal(true, res.stdOut.startsWith('-----BEGIN PGP PRIVATE KEY BLOCK-----'), res.stdOut);
      done();
    });
  });

  it('pemPublicKey', (done) => {
    const rqa: RequestAscii = new RequestAscii({
      fingerprint: key.keyId
    });
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
    const rqa: RequestAscii = new RequestAscii({
      fingerprint: key.keyId
    });
    gpg.useMock().sshPublic(rqa, (res: Result) => {
      // console.log(res);
      assert.equal(true, res.stdOut.startsWith('ssh-rsa '), res.stdOut);
      done();
    });
  });

});
