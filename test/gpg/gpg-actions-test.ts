import { assert } from 'chai';
import * as Rimraf from 'rimraf';

import { Result, Gpg, createTest } from '../../src/gpg';

import {
  KeyGenUid,
  KeyGen,
  KeyInfo,
  KeyToYubiKey,
  SecretKey,
  Pin
} from '../../src/gpg/types';

import { RequestAscii } from '../../src/model';
// import { findDOMNode } from 'react-dom';
// import { dirname } from 'path';

const timeout = 180 * 1000;

function expireDate(): Date {
  const now = new Date();
  now.setFullYear(now.getFullYear() + 5);
  return now;
}

function keyGen(): KeyGen {
  const keygen = new KeyGen();
  keygen.keyInfo.length._value.set(1024);
  keygen.keyInfo.type._value.set('RSA');
  keygen.expireDate.date.set(expireDate());
  keygen.password._value.set('Gpg Test Jojo Akzu Luso');
  const keyInfo = new KeyInfo();
  keyInfo.length._value.set(1024);
  keyInfo.type._value.set('RSA');
  keyInfo.usage.values.replace(['sign', 'encr', 'auth']);
  keygen.subKeys.add(keyInfo);
  const uid = new KeyGenUid();
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

  beforeAll(async (): Promise<void> => {
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
            gpg.createSubkey(
              key.fingerPrint.fpr,
              keyGen(),
              keyGen().subKeys.first(),
              (_res: Result) => {
                /*
                console.log(
                  `Use GPG ${_res.gpg.getGpgCmd()}:${_res.gpg.homeDir}:${
                    key.keyId
                  }`
                );
                */
                assert.equal(0, _res.exitCode);
                resolve();
              }
            );
          });
        });
      } catch (e) {
        rej(e);
      }
    });
  }, timeout);

  afterAll(async () => {
    // console.log(`afterAll`);
    return new Promise(rs => {
      gpg.deleteSecretKey(key.fingerPrint.fpr, (res: Result) => {
        assert.equal(res.exitCode, 0, 'delete secret key');
        gpg.deletePublicKey(key.fingerPrint.fpr, (_res: Result) => {
          assert.equal(_res.exitCode, 0, 'delete pub key');
          gpg.list_secret_keys((err: string, keys: SecretKey[]) => {
            assert.equal(keys.length, 0);
            gpg.runAgent(['killagent', '/bye'], null, (__res: Result) => {
              Rimraf.sync(gpg.homeDir);
              rs();
            });
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

  it('prepareToYubiKey', async () => {
    // this.timeout(100000);
    const kytk = new KeyToYubiKey({
      fingerprint: key.keyId,
      passphrase: 'Gpg Test Jojo Akzu Luso',
      card_id: 'TbdCardId',
      slot_id: 42
    });
    return new Promise(rs => {
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
          rs();
        });
      });
    });
  }, timeout);

  it('keyToSmartCard with Mock', async () => {
    // this.timeout(100000);
    // console.log('-1');
    const mygpg = gpg.useMock();
    // console.log('-2');
    const kytk = new KeyToYubiKey({
      fingerprint: key.keyId,
      card_id: 'Smarte-Karte',
      slot_id: 4711,
      passphrase: 'Gpg Test Jojo Akzu Luso',
      admin_pin: new Pin({pin: '12345678'}),
    });
    // console.log('-3');
    return new Promise((rs, rj) => {
      mygpg.keyToYubiKey(kytk, (res: Result) => {
        try {
          // console.log('-3.1');
          assert.equal(0, res.exitCode, `unknown exit code ${res.stdErr}`);
          // console.log('-3.2');
          assert.equal(
            res.execTransaction.data.readFds[0].value,
            `${kytk.passphrase}\n`
          );
          // console.log('-3.3');
          assert.equal(
            res.execTransaction.data.readFds[1].value,
            `${kytk.admin_pin.pin}\n`
          );
          // console.log('-3.4');
          rs();
        } catch (e) {
          rj(e);
        }
      });
    });
  }, timeout);

  it('getSocketName', async () => {
    return new Promise(rs => {
      gpg.useMock().getSocketName((s: string) => {
        assert.isNotNull(s);
        assert.ok(s.length > 0);
        // console.log('getSocketName:', s);
        rs();
      });
    });
  }, timeout);

  it('pemPrivateKey', async () => {
    // this.timeout(10000);
    const rqa: RequestAscii = new RequestAscii({
      fingerprint: key.keyId,
      passphrase: 'Gpg Test Jojo Akzu Luso'
    });
    return new Promise(rs => {
      gpg.useMock().pemPrivateKey(rqa, (res: Result) => {
        assert.equal(
          true,
          res.stdOut.startsWith('-----BEGIN PGP PRIVATE KEY BLOCK-----'),
          res.stdOut
        );
        rs();
      });
    });
  }, timeout);

  it('pemPublicKey', async () => {
    const rqa: RequestAscii = new RequestAscii({
      fingerprint: key.keyId
    });
    return new Promise(rs => {
      gpg.useMock().pemPublicKey(rqa, (res: Result) => {
        assert.equal(
          true,
          res.stdOut.startsWith('-----BEGIN PGP PUBLIC KEY BLOCK-----'),
          res.stdOut
        );
        rs();
      });
    });
  }, timeout);

  // it('pemRevocation', (done) => {
  //   let rqa : RequestAscii = new RequestAscii();
  //   rqa.fingerprint = key.keyId;
  //   gpg.pemRevocation(rqa, (res: Result) => {
  //     assert.equal(true, res.stdOut.startsWith('-----BEGIN PGP PUBLIC KEY BLOCK-----'), res.stdOut)
  //     done();
  //   })
  // })

  it('sshPublic', async () => {
    const rqa: RequestAscii = new RequestAscii({
      fingerprint: key.keyId
    });
    return new Promise(rs => {
      gpg.useMock().sshPublic(rqa, (res: Result) => {
        // console.log(res);
        assert.equal(true, res.stdOut.startsWith('ssh-rsa '), res.stdOut);
        rs();
      });
    });
  }, timeout);
});
