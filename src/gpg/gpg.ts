
import * as ListSecretKeys from './list-secret-keys';
import * as CardStatus from './card-status';
import * as path from 'path';
import * as fs from 'fs';
// import * as fsPromise from "fs-promise";
// import * as fsPromise from 'fs-extra';
// import * as pse from "../pinentry/server";
// import * as Ac from './agent-conf';
import * as uuid from 'node-uuid';

import KeyToYubiKey from './key-to-yubikey';

import * as KeyGen from './key-gen';
import ChangeCard from './change-card';
import RequestAscii from '../model/request-ascii';
import RequestChangePin from './request-change-pin';
import KeyGenUid from './key-gen-uid';
import { format_date } from '../model/helper';
// import * as rimraf from 'rimraf';
import { Result, Mixed, ResultContainer, ResultObservable, ResultObserver, ResultQueue } from './result';
// import GpgVersion from './gpg-version';
import * as rx from 'rxjs';
// import { Observer } from '../server/observer';
// import { Observable } from 'rxjs/Observable';
// import { observer } from 'mobx-react';
import GpgCmds from './gpg-cmds';
// import { Socket } from 'net';

interface SocketNames {
  s1: string;
  s2: string;
}

interface ChangeCardAttribute {
  name: string;
  value: string[];
}

function createTempDir(rq: ResultQueue, baseDir: string, dirName: string): ResultObservable<string> {
  return rx.Observable.create((obs: ResultObserver<string>) => {
    const result = ResultContainer.builder<string>(rq);
    result.data = path.join(baseDir, dirName);
    fs.mkdir(result.data, (mkdirErr) => {
      if (mkdirErr) {
        obs.next(result.setNodeError(mkdirErr));
        obs.complete();
        return;
      }
      fs.chmod(result.data, 0o700, (chmodErr) => {
        if (chmodErr) {
          obs.next(result.setNodeError(chmodErr));
          obs.complete();
          return;
        }
        obs.next(result);
        obs.complete();
      });
    });
  });
}

export class Gpg {
  public homeDir: string = path.join(process.env.HOME, '.gnupg');
  public workDir: string = process.cwd();
  public gpgCmds: GpgCmds;
  public readonly mockCmd: GpgCmds;

  public static _create(mockCmd: GpgCmds): Gpg {
    return new Gpg(mockCmd);
  }

  private constructor(mockCmd: GpgCmds) {
    // this.gpgCmd = 'gpg2';
    // this.gpgAgentCmd = 'gpg-connect-agent';
    this.mockCmd = mockCmd;
  }

  public run<A = void>(initiator: string, attributes: Mixed[], stdIn: string): rx.Observable<ResultContainer<A>> {
    return this.gpgCmds.gpg.data.run<A>(initiator, this.homeDir, attributes, stdIn);
  }

  public runAgent<A = void>(initiator: string, attributes: Mixed[], stdIn: string): rx.Observable<ResultContainer<A>> {
    return this.gpgCmds.agent.data.run<A>(initiator, this.homeDir, attributes, stdIn);
  }

  public clone(): Gpg {
    let ret = new Gpg(this.mockCmd);
    ret.homeDir = this.homeDir;
    ret.workDir = this.workDir;
    ret.gpgCmds = this.gpgCmds;
    return ret;
  }

  public useMock(): Gpg {
    const mock = this.clone();
    mock.setGpgCmds(mock.mockCmd);
    return mock;
  }

  public info(title: string): string {
    if (title.length) {
      title = `${title}-`;
    }
    // console.log('INFO:', this.gpgCmds);
    return [
      `${title}Exec:${this.gpgCmds.gpg.data.info()}`,
      `${title}Agent:${this.gpgCmds.agent.data.info()}`,
      `${title}HomeDir:[${this.homeDir}]`].join(`\n`);
  }
  // public write_pinentry_sh(fname: string, cb: (err: any) => void) {
  //   fs.writeFile(fname, [
  //     '#!' + process.argv[0],
  //     "let pinentry = require(path.join(process.env.F_MOD_HOME), 'pinentry', 'client'));",
  //     "pinentry.client(process.env.S_PINENTRY_SOCKET);"
  //   ].join("\n"), (err) => {
  //     fs.chmod(fname, 0o755, cb);
  //   });
  // }

  // public write_agent_conf(pinentryPath: string, cb: (err: any) => void): void {
  //   let gpgAgentFname = path.join(this.homeDir, 'gpg-agent.conf');
  //   Ac.AgentConf.read_file(gpgAgentFname, (err: any, ag: Ac.AgentConf) => {
  //     if (err) {
  //       cb(err);
  //       return;
  //     }
  //     let pp = 'pinentry-program';
  //     let pv = pinentryPath;
  //     let als = ag.find(pp);
  //     if (!als) {
  //       als = [new Ac.AgentLine([pp, pv].join(' '))];
  //     }
  //     als.forEach((al: Ac.AgentLine) => { al.value = pv; });
  //     ag.write_file(gpgAgentFname, (errx: string) => {
  //       if (errx) {
  //         cb(errx);
  //         return;
  //       }
  //       cb(null);
  //     });
  //   });
  // }

  public setPinentryUrl(url: string): Gpg {
    return this;
  }

  public setHomeDir(fname: string): Gpg {
    console.log('setHomeDir:', fname);
    this.homeDir = fname;
    return this;
  }

  public setGpgCmds(cmd: GpgCmds): Gpg {
    this.gpgCmds = cmd;
    return this;
  }

  public started(): rx.Observable<Result> {
    return this.run('started', ['--print-md', 'md5'], 'test');
  }

  public getSocketName(): ResultObservable<string> {
    return rx.Observable.create((obs: ResultObserver<string>) => {
      // console.log('gsn--1');
      this.runAgent<string>('getSocketName', ['GETINFO socket_name', '/bye'], null).subscribe(res => {
        // console.log('gsn--2');
        if (res.doProgress(obs)) { return; }
        if (res.doError(obs)) { return; }
        // console.log('gsn--3');
        const line = res.exec.stdOut.split(/[\n\r]+/).find((linex) => linex.startsWith('D '));
        if (!line) {
          res.data = null;
        } else {
          res.data = line.slice('D '.length);
        }
        res.doComplete(obs);
      });
    });
  }

  private resetCommand(): string {
    return [
      '/hex',
      'scd serialno',
      'scd apdu 00 20 00 81 08 40 40 40 40 40 40 40 40',
      'scd apdu 00 20 00 81 08 40 40 40 40 40 40 40 40',
      'scd apdu 00 20 00 81 08 40 40 40 40 40 40 40 40',
      'scd apdu 00 20 00 81 08 40 40 40 40 40 40 40 40',
      'scd apdu 00 20 00 83 08 40 40 40 40 40 40 40 40',
      'scd apdu 00 20 00 83 08 40 40 40 40 40 40 40 40',
      'scd apdu 00 20 00 83 08 40 40 40 40 40 40 40 40',
      'scd apdu 00 20 00 83 08 40 40 40 40 40 40 40 40',
      'scd apdu 00 e6 00 00',
      'scd apdu 00 44 00 00', ''].join(`\n`);
  }

  public resetYubikey(): rx.Observable<Result> {
    return this.runAgent('resetYubikey', [], this.resetCommand());
  }

  public getSecretKey(fpr: string): ResultObservable<ListSecretKeys.SecretKey> {
    return rx.Observable.create((obs: ResultObserver<ListSecretKeys.SecretKey>) => {
      this.list_secret_keys().subscribe(result => {
        if (result.doProgress(obs)) { return; }
        if (result.doError(obs)) { return; }
        if (result.data.fingerPrint.fpr == fpr) {
          obs.next(result);
        }
      }, null, () => {
        obs.complete();
      });
    });
  }

  public list_secret_keys(): ResultObservable<ListSecretKeys.SecretKey> {
    return rx.Observable.create((obs: ResultObserver<ListSecretKeys.SecretKey>) => {
      this.run<ListSecretKeys.SecretKey>('list_secret_keys',
        ['--list-secret-keys', '--with-colons'], null).subscribe(result => {
          if (result.doProgress(obs)) { return; }
          if (result.doError(obs)) { return; }
          ListSecretKeys.run(result.exec.stdOut).forEach(lsk => obs.next(result.clone(lsk)));
          obs.complete();
        });
    });
  }

  public card_status(): ResultObservable<CardStatus.Gpg2CardStatus> {
    return rx.Observable.create((obs: ResultObserver<CardStatus.Gpg2CardStatus>) => {
      this.run<CardStatus.Gpg2CardStatus>('card_status', ['--card-status', '--with-colons'], null)
        .subscribe(result => {
          if (result.doProgress(obs)) { return; }
          if (result.doError(obs)) { return; }
          CardStatus.run(result.exec.stdOut).forEach(cs => obs.next(result.clone(cs)));
          obs.complete();
        });
    });
  }

  public deleteSecretKey(fingerPrint: string): ResultObservable {
    return rx.Observable.create((obs: ResultObserver) => {
      this.getSecretKey(fingerPrint).subscribe(key => {
        if (key.doProgress(obs)) { return; }
        if (key.doError(obs)) { return; }
        const args: Mixed[] = ['--no-tty'];
        args.push('--expert', '--batch', '--yes', '--delete-secret-key', fingerPrint);
        this.run('deleteSecretKey', args, null).subscribe(result => {
          if (result.doProgress(obs)) { return; }
          if (result.doError(obs)) { return; }
          key.doComplete(obs);
        });
      });
    });
  }

  public deletePublicKey(fingerPrint: string): ResultObservable {
    return this.run('deletePublicKey', ['--batch', '--delete-key', fingerPrint], null);
  }

  public createMasterKey(keyGen: KeyGen.KeyGen): ResultObservable {
    //  '--enable-large-rsa',
    let args: Mixed[] = [
      '--no-tty', '--pinentry-mode', 'loopback',
      '--passphrase-fd',
      () => {
        return `${keyGen.password.value}\n`;
      },
      '--passphrase-fd',
      () => {
        return `${keyGen.password.value}\n`;
      },
      '--full-gen-key',
      '--batch'
    ];
    // console.log('createMasterKey:', this.gpgCmd, this.gpgCmdArgs, args);
    return this.run('createMasterKey', args, keyGen.masterCommand());
  }

  public pemPrivateKey(rqa: RequestAscii): ResultObservable {
    let args = [
      '--no-tty', '--pinentry-mode', 'loopback',
      '--passphrase-fd',
      () => {
        return `${rqa.passphrase.value}\n`;
      },
      '-a', '--export-secret-key', rqa.fingerprint
    ];
    // console.log('pemPrivateKey:', this.homeDir);
    return this.run('pemPrivateKey', args, null);
  }

  public pemPublicKey(rqa: RequestAscii): ResultObservable {
    return this.run('pemPublicKey', ['-a', '--export', rqa.fingerprint], null);
  }

  public pemRevocation(rqa: RequestAscii): ResultObservable {
    return this.run('pemRevocation', ['-a', '--gen-revoke', rqa.fingerprint], null);
  }

  public sshPublic(rqa: RequestAscii): ResultObservable {
    return this.run('sshPublic', ['--export-ssh-key', rqa.fingerprint], null);
  }

  public addUid(fpr: string, kg: KeyGen.KeyGen, uid: KeyGenUid): ResultObservable {
    let args = [
      '--no-tty', '--pinentry-mode', 'loopback',
      '--passphrase-fd',
      () => {
        return kg.password.value;
      },
      '--quick-adduid', fpr,
      uid.toString()
    ];
    // console.log('addUid', args);
    return this.run('addUid', args, null);
  }

  public createSubkey(fpr: string, kg: KeyGen.KeyGen, ki: KeyGen.KeyInfo): ResultObservable {
    // gpg2  --quick-addkey  FDCF2566BA8134E3BAD15B7DDDC4941118503075 rsa2048 sign,auth,encr
    // '--enable-large-rsa'
    const args = [
      '--no-tty', '--pinentry-mode', 'loopback',
      '--passphrase-fd',
      () => {
        return `${kg.password.value}\n`;
      },
      '--quick-addkey', fpr,
      ki.type.value.toLowerCase() + ki.length.value, ki.usage.values.join(','),
      format_date(kg.expireDate.value)
    ];
    // console.log('createSubkey', args);
    return this.run('createSubKey', args, null);
  }

  public changePin(type: string, rcp: RequestChangePin): ResultObservable {
    const args = [
      '--no-tty', '--pinentry-mode', 'loopback',
      '--passphrase-fd', () => {
        return `${rcp.admin_pin.pin}\n`;
      },
      '--passphrase-fd', () => {
        return `${rcp.new_pin.pin}\n`;
      },
      '--passphrase-fd', () => {
        return `${rcp.new_pin.pin}\n`;
      },
      '--change-pin', type, rcp.app_id
    ];
    // console.log('changePin:', args);
    return this.run('changePin', args, null);
  }

  private getSocketNames(g1: Gpg, g2: Gpg): ResultObservable<SocketNames> {
    return rx.Observable.create((obs: ResultObserver<SocketNames>) => {
      g1.getSocketName().subscribe(rs1 => {
        if (rs1.doProgress(obs)) { return; }
        if (rs1.doError(obs)) { return; }
        g2.getSocketName().subscribe(rs2 => {
          if (rs2.doProgress(obs)) { return; }
          if (rs2.doError(obs)) { return; }
          rs2.clone<SocketNames>().setData({ s1: rs1.data, s2: rs2.data }).doComplete(obs);
        });
      });
    });
  }

  public importSecretKey(ktyk: KeyToYubiKey, pem: string): ResultObservable {
    const args = [
      '--pinentry-mode', 'loopback',
      '--passphrase-fd', () => {
        return `${ktyk.passphrase.value}\n`;
      },
      '--import'
    ];
    return this.run('importSecretKey', args, pem);
  }

  private handleImportedSecretedKey(inititator: string, srcGpg: Gpg, dstGpg: Gpg): ResultObservable<void> {
    return rx.Observable.create((obs: ResultObserver) => {
      this.getSocketNames(srcGpg, dstGpg).subscribe(sockNamesRes => {
        if (sockNamesRes.doProgress(obs)) { return; }
        if (sockNamesRes.doError(obs)) { return; }
        dstGpg.runAgent(inititator, ['killagent', '/bye'], null).subscribe(ares => {
          if (ares.doProgress(obs)) { return; }
          if (ares.doError(obs)) { return; }
          if (sockNamesRes.data.s1 != sockNamesRes.data.s2) {
            fs.exists(sockNamesRes.data.s2, exist => {
              if (!exist) {
                ares.doComplete(obs);
                return;
              }
              fs.unlink(sockNamesRes.data.s2, err => {
                if (!err) {
                  ares.clone().setNodeError(err).doComplete(obs);
                  return;
                }
                fs.symlink(sockNamesRes.data.s1, sockNamesRes.data.s2, symerr => {
                  if (!symerr) {
                    ares.clone().setNodeError(err).doComplete(obs);
                    return;
                  }
                  console.log('agent symlink created');
                  ares.doComplete(obs);
                });
              });
            });
          } else {
            console.log('agent killed');
            ares.doComplete(obs);
          }
        });
      });
    });
  }

  public prepareKeyToYubiKey(inititator: string, ktyk: KeyToYubiKey): ResultObservable<Gpg> {
    return rx.Observable.create((obs: ResultObserver<Gpg>) => {
      const rqa = new RequestAscii();
      rqa.fingerprint = ktyk.fingerprint;
      rqa.passphrase = ktyk.passphrase;
      this.pemPrivateKey(rqa).subscribe(pkres => {
        if (pkres.doProgress(obs)) { return; }
        if (pkres.doError(obs)) { return; }
        createTempDir(this.gpgCmds.gpg.resultQueue, this.homeDir,
          `${uuid.v4().toString().slice(0, 16)}.${inititator}.tdir`).subscribe(createdDir => {
          if (createdDir.doProgress(obs)) { return; }
          if (createdDir.doError(obs)) { return; }
          const gpgSmartCard = this.clone();
          gpgSmartCard.setHomeDir(createdDir.data);
          gpgSmartCard.importSecretKey(ktyk, pkres.exec.stdOut).subscribe(iskres => {
            if (iskres.doProgress(obs)) { return; }
            if (iskres.doError(obs)) { return; }
            this.handleImportedSecretedKey(inititator, this, gpgSmartCard).subscribe(hres => {
              if (hres.doProgress(obs)) { return; }
              if (hres.doError(obs)) { return; }
              ResultContainer.builder(gpgSmartCard.gpgCmds.gpg.resultQueue)
                .setData(gpgSmartCard)
                .doComplete(obs);
            });
          });
        }
        );
      });
    });
  }

  public keyToYubiKey(ktyk: KeyToYubiKey): ResultObservable<Gpg> {
    // create copy of the selected key to avoid
    // that this key will removed from the current
    // key database
    return rx.Observable.create((obs: ResultObserver) => {
      this.prepareKeyToYubiKey('keyToYubiKey', ktyk).subscribe(rsgpg => {
        if (rsgpg.doProgress(obs)) { return; }
        if (rsgpg.doError(obs)) { return; }
        const args = [
          '--pinentry-mode', 'loopback',
          '--passphrase-fd', () => {
            return `${ktyk.passphrase.value}\n`;
          },
          '--passphrase-fd', () => {
            return `${ktyk.admin_pin.pin}\n`;
          },
          '--quick-keytocard', ktyk.fingerprint, `${ktyk.slot_id}`, ktyk.card_id
        ];
        rsgpg.data.run('keyToYubiKey', args, null).subscribe(resx => {
          if (resx.doProgress(obs)) { return; }
          if (resx.doError(obs)) { return; }
          rsgpg.doComplete(obs);
        });
      });
    });
  }

  public changeCard(cc: ChangeCard): ResultObservable<void> {
    const sname = cc.name.split(/\s+/);
    const actions: ChangeCardAttribute[] = [
      { name: 'name', value: [sname.slice(1).join(' '), sname[0]] },
      { name: 'language', value: [cc.lang] },
      { name: 'sex', value: [cc.sex[0] == 'f' ? '2' : '1'] },
      { name: 'login', value: [cc.login] },
      { name: 'url', value: [cc.url] }
    ];
    return rx.Observable.create((obs: ResultObserver) => {
      this._changeCard(obs, cc, actions);
    });
  }

  private _changeCard(obs: ResultObserver, cc: ChangeCard, actions: ChangeCardAttribute[]): void {
    if (actions.length == 0) {
      obs.complete();
      return;
    }
    const current = actions.shift();
    this.changeAttribute(cc.adminPin.pin, current.name, current.value, cc.serialNo)
      .subscribe(res => {
        if (res.doProgress(obs)) { return; }
        if (res.doError(obs)) { return; }
        obs.next(res);
        this._changeCard(obs, cc, actions);
      });
  }

  private changeAttribute(adminPin: string, attrName: string,
    value: string[], serialNo: string): ResultObservable {
    // create copy of the selected key to avoid
    // that this key will removed from the current
    // key database
    const args = [
      '--pinentry-mode', 'loopback',
      '--passphrase-fd', () => {
        // console.log(">>keyToYubiKey:passphrase[", ktyk.passphrase.value, "]")
        return adminPin; // + "\n"
      },
      '--change-card',
      attrName
    ].concat(value);
    args.push(serialNo);
    // console.log('changeCard', args);
    return this.run('changeAttribute', args, null);
  }
}

function findMock(rq: ResultQueue, obs: ResultObserver<string>, dirname: string): void {
  // let gmExists = false;
  let prevDirname = dirname;
  dirname = path.dirname(dirname);
  const gm = path.join(dirname, 'gpg-mock.js');
  const rc = ResultContainer.builder<string>(rq);
  rc.log(obs, `findMock:${gm}`);
  // console.log('Zzz-1:', gm);
  fs.exists(gm, (exist: boolean) => {
    // console.log('Zzz-2:', gm, exist);
    if (exist) {
      rc.setData(gm).doComplete(obs);
    } else {
      if (prevDirname != dirname) {
        findMock(rq, obs, dirname);
      } else {
        rc.doComplete(obs);
      }
    }
  });
}

function gpgCmdMock(rq: ResultQueue): rx.Observable<ResultContainer<GpgCmds>> {
  let dirname = process.argv[process.argv.length - 1];
  return rx.Observable.create((gcobs: ResultObserver<GpgCmds>) => {
    // console.log('Yyz-1:', dirname);
    rx.Observable.create((obs: ResultObserver<string>) => {
      // console.log('Yyz-2:', dirname);
      findMock(rq, obs, dirname);
    }).subscribe((rcgm: ResultContainer<string>) => {
      // console.log('Yyz-3:', process.execPath, rcgm.data, rcgm.isOk(), rcgm.progress);
      if (rcgm.doProgress(gcobs)) { return; }
      if (rcgm.doError(gcobs)) { return; }
      // console.log('Yyz-3.1:', process.execPath, rcgm.data);
      GpgCmds.create(rq, [process.execPath, rcgm.data], [process.execPath, rcgm.data, 'connect-agent'],
        0, true).subscribe(a => {
          // console.log('Yyz-4:', a.isError(), a.progress);
          if (a.doProgress(gcobs)) { return; }
          if (a.doError(gcobs)) { return; }
          // console.log('Yyz-4.1:', a.data);
          a.doComplete(gcobs);
        });
    });
  });
}

const GPGMINVERSION = 2001018;

function possibleGpgCmds(rq: ResultQueue): ResultObservable<GpgCmds>[] {
  return [
    GpgCmds.create(rq, ['/usr/bin/gpg'], ['/usr/bin/gpg-connect-agent'], 0),
    GpgCmds.create(rq, ['/usr/bin/gpg2'], ['/usr/bin/gpg-connect-agent'], 1),
    GpgCmds.create(rq, ['/usr/local/bin/gpg'], ['/usr/local/bin/gpg-connect-agent'], 2),
    GpgCmds.create(rq, ['/usr/local/bin/gpg2'], ['/usr/local/bin/gpg-connect-agent'], 3),
    GpgCmds.create(rq, ['../gpg/gnupg/g10/gpg'], ['../gpg/gnupg/tools/gpg-connect-agent'], 4),
    GpgCmds.create(rq, ['/gnupg/g10/gpg'], ['/gnupg/tools/gpg-connect-agent'], 5)
  ];
}

function resolveCmds(obs: rx.Observer<ResultContainer<GpgCmds[]>>, gpgCmds: ResultObservable<GpgCmds>[],
  ret: ResultContainer<GpgCmds[]>): void {
  // console.log('Yyy-4:');
  if (gpgCmds.length == 0) {
    obs.next(ret);
    obs.complete();
    return;
  }
  const work = gpgCmds.shift();
  work.subscribe(gpgcmds => {
    if (gpgcmds.doProgress(obs)) { return; }
    if (gpgcmds.isOk()) {
      ret.data.push(gpgcmds.data); // only add valid cmds
    }
    resolveCmds(obs, gpgCmds, ret);
  });
  return;
}

export function internalCreate(rq: ResultQueue, gpgCmds: ResultObservable<GpgCmds>[]): ResultObservable<GpgCmds[]> {
  return rx.Observable.create((obs: rx.Observer<ResultContainer<GpgCmds[]>>) => {
    gpgCmdMock(rq).subscribe(mock => {
      // console.log('Yyx-3:');
      if (mock.doProgress(obs)) { return; }
      if (mock.doError(obs)) { return; }
      resolveCmds(obs, gpgCmds, ResultContainer.builder<GpgCmds[]>(rq).setData([mock.data]));
    });
  });
}

function _silentCreate(rq: ResultQueue, gpgCmds: ResultObservable<GpgCmds>[], title: string): ResultObservable<Gpg> {
  return rx.Observable.create((obs: ResultObserver<Gpg>) => {
    // console.log('Yyx-1:');
    internalCreate(rq, gpgCmds).subscribe((rc: ResultContainer<GpgCmds[]>) => {
      // console.log('Yyx-2:');
      if (rc.doProgress(obs)) { return; }
      const rcgpg = rc.clone<Gpg>();
      if (!rc.isError() && rc.data.length > 0) {
        const mock = rc.data.find(a => a.mock);
        const gcmds = rc.data.filter(a => !a.mock)
          .sort((a, b) => b.order - a.order)
          .find(a => a.gpg.data.version.data.versionNumber() >= GPGMINVERSION) || mock;
        rcgpg.data = Gpg._create(mock);
        rcgpg.data.setGpgCmds(gcmds);
      }
      rcgpg.doComplete(obs);
    });
  });
}

export function create(rq: ResultQueue, gpgCmds: ResultObservable<GpgCmds>[] = null,
  title = ''): ResultObservable<Gpg> {
  if (!gpgCmds) {
    gpgCmds = possibleGpgCmds(rq);
  }
  return rx.Observable.create((obs: ResultObserver<Gpg>) => {
    _silentCreate(rq, gpgCmds, title).subscribe(rsgpg => {
      if (rsgpg.doProgress(obs)) { return; }
      if (rsgpg.isError()) {
        console.log(`Failed to Create GPG:${title}`);
      } else {
        console.log(rsgpg.data.info(title));
      }
      rsgpg.doComplete(obs);
    });
  });
}

export function createTest(rq: ResultQueue, gpgCmds: ResultObservable<GpgCmds>[] = null,
  title = 'Test'): ResultObservable<Gpg> {
  if (!gpgCmds) {
    gpgCmds = possibleGpgCmds(rq);
  }
  // console.log('Yxx-2:');
  return rx.Observable.create((obs: ResultObserver<Gpg>) => {
    // console.log('Yxx-3:');
    _silentCreate(rq, gpgCmds, title).subscribe(rcgpg => {
      // console.log('Yxx-4:');
      if (rcgpg.doProgress(obs)) { return; }
      if (rcgpg.doError(obs)) {
        console.log(`Failed to Create GPG:${title}`);
        return;
      }
      createTempDir(rq, process.cwd(), `${uuid.v4().toString().slice(0, 16)}.tdir`).subscribe(rcs => {
        // console.log('Yxx-5:');
        if (rcs.doProgress(obs)) { return; }
        if (rcs.doError(obs)) {
          console.log(`Failed to Create GPG:${title}`);
          return;
        }
        rcgpg.data.setHomeDir(rcs.data);
        console.log(rcgpg.data.info(title));
        rcgpg.doComplete(obs);
      });
    });
  });
}

export function createMock(rq: ResultQueue): ResultObservable<Gpg> {
  // console.log('Yxx-1:');
  return createTest(rq, [], 'Mock');
}

export default Gpg;
