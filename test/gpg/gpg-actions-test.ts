
import { assert } from 'chai';

import * as Gpg from '../../src/gpg/gpg';
import { ResultObservable, ResultExec } from '../../src/gpg/result';

import * as ListSecretKeys from '../../src/gpg/list-secret-keys';

import KeyGenUid from '../../src/gpg/key-gen-uid';
import { KeyGen, KeyInfo } from '../../src/gpg/key-gen';
import { ResultQueue } from '../../src/gpg/result';

import { RequestAscii } from '../../src/model/request-ascii';
import KeyToYubiKey from '../../src/gpg/key-to-yubikey';
import safeRaf from '../safe-raf';
// import * as rx from 'rxjs';
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

function createMasterKey(gpg: Gpg.Gpg): ResultObservable {
  return gpg.createMasterKey(keyGen());
}

describe('Gpg', () => {
  let gpg: Gpg.Gpg;
  let key: ListSecretKeys.SecretKey;
  let rq: ResultQueue = null;

  before(async function (): Promise<void> {
    this.timeout(100000);
    rq = ResultQueue.create();
    return new Promise<void>(async (resolve, rej) => {
      Gpg.createTest(rq).subscribe(gpgres => {
        if (gpgres.doProgress()) { return; }
        if (gpgres.isError()) {
          rej(gpgres);
          return;
        }
        gpg = gpgres.data;
        // console.log('============');
        createMasterKey(gpg).subscribe((res) => {
          if (res.doProgress()) { return; }
          assert.equal(false, res.isError());
          // console.log('------------', res);
          gpg.list_secret_keys().subscribe(_key => {
            if (_key.doProgress()) { return; }
            assert.equal(false, _key.isError());
            let uid = _key.data.uids[0];
            assert.equal(uid.name, 'Gpg Test Master');
            assert.equal(uid.email, 'gpg.sock@lodke.gpg');
            key = _key.data;
            // console.log('=========', keyGen().subKeys.pallets[0]);
            gpg.createSubkey(key.fingerPrint.fpr, keyGen(), keyGen().subKeys.first()).subscribe(_res => {
              if (_res.doProgress()) { return; }
              // console.log(_res);
              assert.equal(true, _res.isOk());
              resolve();
            });
          });
        });
      });
    });
  });

  after((done) => {
    console.log(`After:${gpg.homeDir}`);
    gpg.deleteSecretKey(key.fingerPrint.fpr).subscribe(res => {
      if (res.doProgress()) { return; }
      assert.equal(res.isOk(), true, 'delete secret key');
      gpg.deletePublicKey(key.fingerPrint.fpr).subscribe(_res => {
        if (_res.doProgress()) { return; }
        assert.equal(_res.isOk(), true, 'delete pub key');
        gpg.list_secret_keys().filter(i => i.isOk()).toArray().subscribe(data => {
          assert.equal(data.length, 0);
          gpg.runAgent('after', ['killagent', '/bye'], null).subscribe(__res => {
            if (__res.doProgress()) { return; }
            gpg.runAgent('cleanupYubiKey', ['killagent', '/bye'], null).subscribe(cyres => {
              if (cyres.doProgress()) { return; }
              if (cyres.doError()) { return; }
              safeRaf(gpg.homeDir).subscribe(null, null, () => {
                rq.stop().subscribe(() => done());
              });
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

  it('prepareToYubiKey', function (done: any): void {
    this.timeout(100000);
    let kytk = new KeyToYubiKey();
    kytk.fingerprint = key.keyId;
    kytk.passphrase.value = 'Gpg Test Jojo Akzu Luso';
    gpg.prepareKeyToYubiKey('test', kytk).subscribe(res => {
      if (res.doProgress()) { return; }
      assert.equal(true, res.isOk(), `unknown exit code ${res.exec.stdErr}`);
      assert.isNotNull(res.data, 'Gpg should be set');
      res.data.list_secret_keys().filter(i => i.isOk()).toArray().subscribe(keys => {
        assert.equal(1, keys.length, 'len should be one');
        assert.equal('gpg.sock@lodke.gpg', keys[0].data.uids[0].email);
        safeRaf(res.data.homeDir).subscribe(null, null, () => done());
        // console.log(`prepareToYubiKey:${res.data && res.data.homeDir}:${gpg.homeDir}`);
        // done();
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
    mygpg.keyToYubiKey(kytk).subscribe(res => {
      if (res.isProgress()) {
        if (res.progress instanceof ResultExec &&
          res.progress.execTransaction.data.args.yargs.quickKeytocard) {
          assert.equal(res.progress.execTransaction.data.readFds[0].value, `${kytk.passphrase.value}\n`);
          assert.equal(res.progress.execTransaction.data.readFds[1].value, `${kytk.admin_pin.pin}\n`);
        }
      }
      if (res.doProgress()) { return; }
      assert.equal(true, res.isOk(), `unknown exit code ${res.exec.stdErr}`);
      safeRaf(res.data.homeDir).subscribe(null, null, () => done());
      // console.log(`keyToSmartCard:${res.data && res.data.homeDir}:${gpg.homeDir}`);
    });
  });

  it('getSocketName', (done) => {
    gpg.useMock().getSocketName().subscribe(rcs => {
      if (rcs.doProgress()) { return; }
      assert.isTrue(rcs.isOk());
      assert.isNotNull(rcs.data);
      assert.ok(rcs.data.length > 0);
      // console.log('getSocketName:', rcs.data);
      done();
    });
  });

  it('pemPrivateKey', function (done: any): void {
    // this.timeout(10000);
    let rqa: RequestAscii = new RequestAscii();
    rqa.fingerprint = key.keyId;
    rqa.passphrase.value = 'Gpg Test Jojo Akzu Luso';
    gpg.useMock().pemPrivateKey(rqa).subscribe(res => {
      if (res.doProgress()) { return; }
      assert.equal(true, res.exec.stdOut.startsWith('-----BEGIN PGP PRIVATE KEY BLOCK-----'), res.exec.stdOut);
      done();
    });
  });

  it('pemPublicKey', (done) => {
    let rqa: RequestAscii = new RequestAscii();
    rqa.fingerprint = key.keyId;
    gpg.useMock().pemPublicKey(rqa).subscribe(res => {
      if (res.doProgress()) { return; }
      assert.equal(true, res.exec.stdOut.startsWith('-----BEGIN PGP PUBLIC KEY BLOCK-----'), res.exec.stdOut);
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
    gpg.useMock().sshPublic(rqa).subscribe(res => {
      if (res.doProgress()) { return; }
      // console.log(res);
      assert.equal(true, res.exec.stdOut.startsWith('ssh-rsa '), res.exec.stdOut);
      done();
    });
  });

});
