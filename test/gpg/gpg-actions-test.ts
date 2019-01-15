
import { assert } from 'chai';

import * as Gpg from '../../src/gpg/gpg';
import { ResultExec } from '../../src/gpg/result';

import * as ListSecretKeys from '../../src/gpg/list-secret-keys';

import KeyGenUid from '../../src/gpg/key-gen-uid';
import { KeyGen, KeyInfo } from '../../src/gpg/key-gen';
import { ResultQueue } from '../../src/gpg/result';

import { RequestAscii } from '../../src/model/request-ascii';
import KeyToYubiKey from '../../src/gpg/key-to-yubikey';
import safeRaf from '../safe-raf';
import * as rxme from 'rxme';
import { expireDate } from '../../src/model/helper';
import { SocketNames } from '../../src/gpg/gpg';
// import * as rx from 'rxjs';
// import { findDOMNode } from 'react-dom';
// import { dirname } from 'path';

// function expireDate(): Date {
//   let now = new Date();
//   now.setFullYear(now.getFullYear() + 5);
//   return now;
// }

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

function createMasterKey(gpg: Gpg.Gpg): rxme.Observable {
  // console.log('--A');
  return rxme.Observable.create(obs => {
    // console.log('--B');
    gpg.createMasterKey(keyGen()).match(ListSecretKeys.SecretKey.match(res => {
      // console.log('--C');
      gpg.createSubkey(res.fingerPrint.fpr, keyGen(), keyGen().subKeys.first())
        .match(ListSecretKeys.SecretKey.match(resssb => {
        // console.log('--E');
        obs.next(rxme.Msg.Type(resssb));
        return true;
      })).passTo(obs);
      return true;
    })).passTo(obs);
  });
}

describe('Gpg', () => {
  let gpg: Gpg.Gpg;
  let key: ListSecretKeys.SecretKey;
  let rq: ResultQueue = null;

  before(async function (): Promise<void> {
    this.timeout(100000);
    return new Promise<void>(async (resolve, rej) => {
      ResultQueue.create().match(ResultQueue.match(_rq => {
        rq = _rq;
        Gpg.createTest(rq).match(Gpg.Gpg.match(mygpg => {
          // console.log('============');
          // console.log('--0');
          createMasterKey(mygpg).match(ListSecretKeys.SecretKey.match(res => {
            // console.log('--1');
            // if (res.doProgress()) { return; }
            try {
              // assert.equal(false, res.isError());
              let uid = res.uids[0];
              assert.equal(uid.name, 'Gpg Test Master');
              assert.equal(uid.email, 'gpg.sock@lodke.gpg');
              assert.equal(res.subKeys.length, 1);
              key = res;
              resolve();
              // console.log('--2');
            } catch (e) {
              rej(e);
            }
            return true;
          })).passTo();
          return true;
        })).passTo();
        return true;
      }));
    });
  });

  after(function (done): void {
    this.timeout(5000);
    // console.log(`After:${gpg.homeDir}`);
    gpg.deleteSecretKey(key.fingerPrint.fpr).match(ListSecretKeys.SecretKey.match(res => {
      // if (res.doProgress()) { return; }
      // console.log(`After:1:${gpg.homeDir}`);
      // assert.equal(res.isOk(), true, 'delete secret key');
      gpg.deletePublicKey(key.fingerPrint.fpr).match(ListSecretKeys.SecretKey.match(_res => {
        // console.log(`After:2:${gpg.homeDir}`);
        // if (_res.doProgress()) { return; }
        // assert.equal(_res.isOk(), true, 'delete pub key');
        gpg.list_secret_keys().match(data => {
          // console.log(`After:3:${gpg.homeDir}`);
          // assert.equal(data.length, 0);
          gpg.runAgent('after', ['killagent', '/bye'], null).match(ResultExec.match(__res => {
            // console.log(`After:4:${gpg.homeDir}`);
            // if (__res.doProgress()) { return; }
            gpg.runAgent('cleanupYubiKey', ['killagent', '/bye'], null).match(ResultExec.match(___res => {
              // console.log(`After:5:${gpg.homeDir}`, cyres.isError(), cyres.isOk(),
              // cyres.isProgress());
              safeRaf(gpg.homeDir).match(rxme.Matcher.Complete(() => {
                // console.log(`After:6:${gpg.homeDir}`);
                rq.stop().match(rxme.Matcher.Complete(() => done())).passTo();
                return true;
              })).passTo();
              return true;
            })).passTo();
            return true;
          })).passTo();
        }).passTo();
        return true;
      })).passTo();
      return true;
    }));
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
    gpg.prepareKeyToYubiKey('test', kytk).match(Gpg.Gpg.match(res => {
      // if (res.doProgress()) { return; }
      assert.equal(true, res.isOk(), `unknown exit code ${res.stdErr}`);
      assert.isNotNull(res.data, 'Gpg should be set');
      res.list_secret_keys().filter(i => i.isOk()).toArray().match(keys => {
        assert.equal(1, keys.length, 'len should be one');
        assert.equal('gpg.sock@lodke.gpg', keys[0].data.uids[0].email);
        safeRaf(res.homeDir).match(rxme.Matcher.Complete(() => done())).passTo();
        // console.log(`prepareToYubiKey:${res.data && res.data.homeDir}:${gpg.homeDir}`);
        // done();
        return true;
      }).passTo();
      return true;
    })).passTo();
  });

  it('keyToSmartCard with Mock', function (done: any): void {
    this.timeout(100000);
    Gpg.createMock(rq).match(Gpg.Gpg.match(rsmygpg => {
      // if (rsmygpg.doProgress()) { return; }
      createMasterKey(rsmygpg).match(ListSecretKeys.SecretKey.match(reskey => {
        // if (reskey.doProgress()) { return; }
        const kytk = new KeyToYubiKey();
        kytk.fingerprint = reskey.keyId;
        kytk.passphrase.value = 'Gpg Test Jojo Akzu Luso';
        kytk.admin_pin.pin = '12345678';
        kytk.card_id = 'Smarte-Karte';
        kytk.slot_id = 4711;
        rsmygpg.keyToYubiKey(kytk).match(Gpg.Gpg.match(res => {
          if (res.isProgress()) {
            if (res.progress instanceof ResultExec &&
              res.progress.execTransaction.data.args.yargs.quickKeytocard) {
              assert.equal(res.progress.execTransaction.data.readFds[0].value, `${kytk.passphrase.value}\n`);
              assert.equal(res.progress.execTransaction.data.readFds[1].value, `${kytk.admin_pin.pin}\n`);
            }
          }
          // console.log('XXXXX', res.progress);
          if (res.doProgress()) { return; }
          assert.equal(true, res.isOk(), `unknown exit code ${res.exec.stdErr}`);
          safeRaf(res.homeDir).match(rxme.Matcher.Complete(() => done())).passTo();
          // console.log(`keyToSmartCard:${res.data && res.data.homeDir}:${gpg.homeDir}`);
          return true;
        })).passTo();
        return true;
      })).passTo();
      return true;
    })).passTo();
  });

  it('getSocketName', (done) => {
    gpg.getSocketName().match(SocketNames.match(rcs => {
      // assert.isTrue(rcs.isOk());
      // assert.isNotNull(rcs);
      assert.ok(rcs.s1.length > 0);
      assert.ok(rcs.s2.length > 0);
      // console.log('getSocketName:', rcs.data);
      done();
      return true;
    })).passTo();
  });

  it('pemPrivateKey', function (done: any): void {
    // this.timeout(10000);
    let rqa: RequestAscii = new RequestAscii();
    rqa.fingerprint = key.keyId;
    rqa.passphrase.value = 'Gpg Test Jojo Akzu Luso';
    gpg.pemPrivateKey(rqa).match(ResultExec.match(res => {
      // if (res.doProgress()) { return; }
      assert.equal(true, res.stdOut.startsWith('-----BEGIN PGP PRIVATE KEY BLOCK-----'), res.stdOut);
      done();
      return true;
    })).passTo();
  });

  it('pemPublicKey', (done) => {
    let rqa: RequestAscii = new RequestAscii();
    rqa.fingerprint = key.keyId;
    gpg.pemPublicKey(rqa).match(ResultExec.match(res => {
      // if (res.doProgress()) { return; }
      assert.equal(true, res.stdOut.startsWith('-----BEGIN PGP PUBLIC KEY BLOCK-----'), res.stdOut);
      done();
      return true;
    })).passTo();
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
    gpg.sshPublic(rqa).match(ResultExec.match(res => {
      // if (res.doProgress()) { return; }
      // console.log(res);
      assert.equal(true, res.stdOut.startsWith('ssh-rsa '), res.stdOut);
      done();
      return true;
    })).passTo();
  });

});
