
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
import { Mixed, ResultQueue, ResultExec } from './result';
// import GpgVersion from './gpg-version';
import * as rxme from 'rxme';
// import { Observer } from '../server/observer';
// import { Observable } from 'rxjs/Observable';
// import { observer } from 'mobx-react';
import GpgCmds from './gpg-cmds';
import { RxMe } from 'rxme';
import { Gpg2CardStatus } from './card-status';
// import { Socket } from 'net';

export class SocketNames {
  public readonly s1: string;
  public readonly s2: string;

  public static match(cb: rxme.MatcherCallback<SocketNames>): rxme.MatcherCallback {
    return rxme.Matcher.Type<SocketNames>(SocketNames, cb);
  }

  constructor(s1: string, s2: string) {
    this.s1 = s1;
    this.s2 = s2;
  }
}

interface ChangeCardAttribute {
  name: string;
  value: string[];
}

function createTempDir(rq: ResultQueue, baseDir: string, dirName: string): rxme.Observable {
  return rxme.Observable.create(obs => {
    const result = path.join(baseDir, dirName);
    fs.mkdir(result, (mkdirErr) => {
      if (mkdirErr) {
        obs.next(rxme.Msg.Error(mkdirErr));
        obs.complete();
        return;
      }
      fs.chmod(result, 0o700, (chmodErr) => {
        if (chmodErr) {
          obs.next(rxme.Msg.Error(chmodErr));
          obs.complete();
          return;
        }
        obs.next(rxme.Msg.String(result));
        obs.complete();
      });
    });
  });
}

export class Gpg {
  public homeDir: string = path.join(process.env.HOME, '.gnupg');
  public workDir: string = process.cwd();
  public gpgCmds: GpgCmds;
  // public readonly mockCmd: GpgCmds;

  public static match(cb: rxme.MatcherCallback<Gpg>): rxme.MatcherCallback {
    return rxme.Matcher.Type<Gpg>(Gpg, cb);
  }

  public static _create(/* mockCmd: GpgCmds */): Gpg {
    return new Gpg(/* mockCmd */);
  }

  private constructor(/* mockCmd: GpgCmds */) {
    // this.gpgCmd = 'gpg2';
    // this.gpgAgentCmd = 'gpg-connect-agent';
    // this.mockCmd = mockCmd;
  }

  public run(initiator: string, attributes: Mixed[], stdIn: string): rxme.Observable {
    return this.gpgCmds.gpg.run(initiator, this.homeDir, attributes, stdIn);
  }

  public runAgent(initiator: string, attributes: Mixed[], stdIn: string): rxme.Observable {
    return this.gpgCmds.agent.run(initiator, this.homeDir, attributes, stdIn);
  }

  public clone(): Gpg {
    let ret = new Gpg(/* this.mockCmd */);
    ret.homeDir = this.homeDir;
    ret.workDir = this.workDir;
    ret.gpgCmds = this.gpgCmds;
    return ret;
  }

  // public useMock(): Gpg {
  //   const mock = this.clone();
  //   mock.setGpgCmds(mock.mockCmd);
  //   return mock;
  // }

  public resultQueue(): ResultQueue {
    return this.gpgCmds.gpg.resultQueue;
  }

  public info(title: string): string {
    if (title.length) {
      title = `${title}-`;
    }
    // console.log('INFO:', this.gpgCmds);
    return [
      `${title}Exec:${this.gpgCmds.gpg.info()}`,
      `${title}Agent:${this.gpgCmds.agent.info()}`,
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

  public started(): rxme.Observable {
    return this.run('started', ['--print-md', 'md5'], 'test');
  }

  public getSocketName(): rxme.Observable {
    return rxme.Observable.create(obs => {
      // console.log('gsn--1');
      this.runAgent('getSocketName', ['GETINFO socket_name', '/bye'], null).match(ResultExec.match(res => {
        // console.log('gsn--3');
        const line = res.stdOut.split(/[\n\r]+/).find((linex) => linex.startsWith('D '));
        if (line) {
          obs.next(rxme.Msg.String(line.slice('D '.length)));
        }
        obs.complete();
      })).passTo(obs);
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

  public resetYubikey(): rxme.Observable {
    return this.runAgent('resetYubikey', [], this.resetCommand());
  }

  public getSecretKey(fpr: string): rxme.Observable {
    return rxme.Observable.create(obs => {
      this.list_secret_keys().match(ListSecretKeys.SecretKey.match(result => {
        if (result.fingerPrint.fpr == fpr) {
          obs.next(rxme.Msg.Type(result));
        }
        return true;
      })).passTo(obs);
    });
  }

  public list_secret_keys(): rxme.Observable {
    return rxme.Observable.create(obs => {
      this.run('list_secret_keys',
        ['--list-secret-keys', '--with-colons'], null).match(ResultExec.match(result => {
          ListSecretKeys.run(result.stdOut).forEach(lsk => {
            obs.next(rxme.Msg.Type(lsk));
          });
          obs.complete();
          return true;
        })).passTo(obs);
    });
  }

  public card_status(): rxme.Observable {
    return rxme.Observable.create(obs => {
      this.run('card_status', ['--card-status', '--with-colons'], null)
        .match(ResultExec.match(result => {
          CardStatus.run(result.stdOut).forEach(cs => {
            obs.next(rxme.Msg.Type(cs));
          });
          obs.complete();
        })).passTo(obs);
    });
  }

  public deleteSecretKey(fingerPrint: string): rxme.Observable {
    return rxme.Observable.create(obs => {
      this.getSecretKey(fingerPrint).match(ListSecretKeys.SecretKey.match(key => {
        const args: Mixed[] = ['--no-tty'];
        args.push('--expert', '--batch', '--yes', '--delete-secret-key', fingerPrint);
        this.run('deleteSecretKey', args, null).match(ResultExec.match(result => {
          obs.next(rxme.Msg.Type(key));
          obs.complete();
        })).passTo(obs);
      })).passTo(obs);
    });
  }

  public deletePublicKey(fingerPrint: string): rxme.Observable {
    return this.run('deletePublicKey', ['--batch', '--delete-key', fingerPrint], null);
  }

  public findKey(cmp: (sk: ListSecretKeys.SecretKey) => void): rxme.Observable {
    return rxme.Observable.create(obs => {
      let found = false;
      this.list_secret_keys().match(ListSecretKeys.SecretKey.match(ressk => {
        if (cmp(ressk)) {
          found = true;
          obs.next(rxme.Msg.Type(ressk));
          obs.complete();
        }
      })).match(rxme.Matcher.Complete(() => {
        if (!found) {
          obs.next(rxme.Msg.Error('key not found'));
          obs.complete();
        }
      })).passTo(obs);
    });
  }

  public createMasterKey(keyGen: KeyGen.KeyGen): rxme.Observable {
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
    return rxme.Observable.create(obs => {
      // console.log('--X');
      this.run('createMasterKey', args, keyGen.masterCommand()).match(ResultExec.match(rescmk => {
        // console.log('--Y');
        const expireDateNumber = ~~(keyGen.expireDate.value.getTime() / 1000);
        this.findKey((sk): boolean => {
          const ret = Math.abs(sk.expires - expireDateNumber) < 86400 &&
            keyGen.uids.get(0).eq(sk.uids[0].toKeyGenUid());
          // console.log('--Z', ret, sk.expires, expireDateNumber,
          //     Math.abs(sk.expires - expireDateNumber) < 86400,
          //     keyGen.uids.get(0).name.value, keyGen.uids.get(0).email.value, keyGen.uids.get(0).comment.value,
          //     sk.uids[0].toKeyGenUid().name.value, sk.uids[0].toKeyGenUid().email.value,
          //     sk.uids[0].toKeyGenUid().comment.value);
          return ret;
        }).passTo(obs);
      })).passTo(obs);
    });
    // console.log('createMasterKey:', this.gpgCmd, this.gpgCmdArgs, args);
  }

  public createSubkey(fpr: string, kg: KeyGen.KeyGen, ki: KeyGen.KeyInfo): rxme.Observable {
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
    return rxme.Observable.create(obs => {
      this.run('createSubKey', args, null).match(ResultExec.match(rescmk => {
        this.findKey((sk): boolean => {
          // console.log('---', sk.fingerPrint.fpr, fpr);
          return sk.fingerPrint.fpr == fpr;
        }).match(ListSecretKeys.SecretKey.match(resfind => {
          obs.complete();
        })).passTo(obs);
      })).passTo(obs);
    });
  }

  public pemPrivateKey(rqa: RequestAscii): rxme.Observable {
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

  public pemPublicKey(rqa: RequestAscii): rxme.Observable {
    return this.run('pemPublicKey', ['-a', '--export', rqa.fingerprint], null);
  }

  public pemRevocation(rqa: RequestAscii): rxme.Observable {
    return this.run('pemRevocation', ['-a', '--gen-revoke', rqa.fingerprint], null);
  }

  public sshPublic(rqa: RequestAscii): rxme.Observable {
    return this.run('sshPublic', ['--export-ssh-key', rqa.fingerprint], null);
  }

  public addUid(fpr: string, kg: KeyGen.KeyGen, uid: KeyGenUid): rxme.Observable {
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

  public changePin(type: string, rcp: RequestChangePin): rxme.Observable {
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

  private getSocketNames(g1: Gpg, g2: Gpg): rxme.Observable {
    return rxme.Observable.create(obs => {
      g1.getSocketName().match(rxme.Matcher.String(rs1 => {
        g2.getSocketName().match(rxme.Matcher.String(rs2 => {
          obs.next(rxme.Msg.Type(new SocketNames(rs1, rs2)));
        })).passTo(obs);
      })).passTo(obs);
    });
  }

  public importSecretKey(ktyk: KeyToYubiKey, pem: string): rxme.Observable {
    const args = [
      '--pinentry-mode', 'loopback',
      '--passphrase-fd', () => {
        return `${ktyk.passphrase.value}\n`;
      },
      '--import'
    ];
    return this.run('importSecretKey', args, pem);
  }

  private handleImportedSecretedKey(inititator: string, srcGpg: Gpg, dstGpg: Gpg): rxme.Observable {
    return rxme.Observable.create(obs => {
      this.getSocketNames(srcGpg, dstGpg).match(SocketNames.match(sockNamesRes => {
        dstGpg.runAgent(inititator, ['killagent', '/bye'], null).match(ResultExec.match(ares => {
          if (sockNamesRes.s1 != sockNamesRes.s2) {
            fs.exists(sockNamesRes.s2, exist => {
              if (!exist) {
                obs.next(rxme.Msg.Error(`socket not found ${sockNamesRes.s2}`));
                obs.complete();
                return;
              }
              fs.unlink(sockNamesRes.s2, err => {
                if (!err) {
                  obs.next(rxme.Msg.Error(err));
                  obs.complete();
                  return;
                }
                fs.symlink(sockNamesRes.s1, sockNamesRes.s2, symerr => {
                  if (!symerr) {
                    obs.next(rxme.Msg.Error(symerr));
                    obs.complete();
                    return;
                  }
                  obs.next(rxme.LogInfo('agent symlink created'));
                  obs.complete();
                });
              });
            });
          } else {
            obs.next(rxme.LogInfo('agent killed'));
            obs.complete();
          }
        }));
      })).passTo(obs);
    });
  }

  public prepareKeyToYubiKey(inititator: string, ktyk: KeyToYubiKey): rxme.Observable {
    return rxme.Observable.create(obs => {
      const rqa = new RequestAscii();
      rqa.fingerprint = ktyk.fingerprint;
      rqa.passphrase = ktyk.passphrase;
      this.pemPrivateKey(rqa).match(ResultExec.match(pkres => {
        // console.log('XXXXX', pkres.exec.stdOut, ktyk.fingerprint, 'YYYYY');
        createTempDir(this.gpgCmds.gpg.resultQueue, this.homeDir,
          `${uuid.v4().toString().slice(0, 16)}.${inititator}.tdir`).match(rxme.Matcher.String(createdDir => {
            const gpgSmartCard = this.clone();
            gpgSmartCard.setHomeDir(createdDir);
            obs.next(rxme.LogInfo(`[${pkres.stdOut}]`));
            // console.log(`[${pkres.exec.stdOut}]`);
            gpgSmartCard.importSecretKey(ktyk, pkres.stdOut).match(ResultExec.match(iskres => {
              // console.log(iskres);
              this.handleImportedSecretedKey(inititator, this, gpgSmartCard).match(_ => {
                obs.next(rxme.Msg.Type(gpgSmartCard));
                obs.complete();
              });
            })).passTo(obs);
          })).passTo(obs);
      })).passTo(obs);
    });
  }

  public keyToYubiKey(ktyk: KeyToYubiKey): rxme.Observable {
    // create copy of the selected key to avoid
    // that this key will removed from the current
    // key database
    return rxme.Observable.create(obs => {
      this.prepareKeyToYubiKey('keyToYubiKey', ktyk).match(Gpg.match(rsgpg => {
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
        rsgpg.run('keyToYubiKey', args, null).match(ResultExec.match(resx => {
          obs.next(rxme.Msg.Type(rsgpg));
          obs.complete();
          return true;
        }));
      }));
    });
  }

  public changeCard(cc: ChangeCard): rxme.Observable {
    const sname = cc.name.split(/\s+/);
    const actions: ChangeCardAttribute[] = [
      { name: 'name', value: [sname.slice(1).join(' '), sname[0]] },
      { name: 'language', value: [cc.lang] },
      { name: 'sex', value: [cc.sex[0] == 'f' ? '2' : '1'] },
      { name: 'login', value: [cc.login] },
      { name: 'url', value: [cc.url] }
    ];
    return rxme.Observable.create(obs => {
      this._changeCard(obs, cc, actions);
    });
  }

  private _changeCard(obs: rxme.Observer, cc: ChangeCard, actions: ChangeCardAttribute[]): void {
    if (actions.length == 0) {
      obs.complete();
      return;
    }
    const current = actions.shift();
    this.changeAttribute(cc.adminPin.pin, current.name, current.value, cc.serialNo)
      .match(ResultExec.match(res => {
        obs.next(rxme.Msg.Type(res));
        this._changeCard(obs, cc, actions);
      })).passTo(obs);
  }

  private changeAttribute(adminPin: string, attrName: string,
    value: string[], serialNo: string): rxme.Observable {
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

function findMock(rq: ResultQueue, obs: rxme.Observer, dirname: string): void {
  // let gmExists = false;
  let prevDirname = dirname;
  dirname = path.dirname(dirname);
  const gm = path.join(dirname, 'gpg-mock.js');
  // const rc = ResultContainer.builder<string>(rq);
  obs.next(rxme.LogInfo(`findMock:${gm}`));
  // console.log('Zzz-1:', gm);
  fs.exists(gm, (exist: boolean) => {
    // console.log('Zzz-2:', gm, exist);
    if (exist) {
      obs.next(rxme.Msg.String(gm));
    } else {
      if (prevDirname != dirname) {
        findMock(rq, obs, dirname);
      } else {
        obs.next(rxme.Msg.Type(rq));
        obs.complete();
      }
    }
  });
}

function gpgCmdMock(rq: ResultQueue): rxme.Observable {
  const dirname = process.argv[process.argv.length - 1];
  return rxme.Observable.create(gcobs => {
    // console.log('Yyz-1:', dirname);
    rxme.Observable.create(obs => {
      // console.log('Yyz-2:', dirname);
      findMock(rq, obs, dirname);
    }).match(rxme.Matcher.String(rcgm => {
      // console.log('Yyz-3:', process.execPath, rcgm.data, rcgm.isOk(), rcgm.progress);
      // console.log('Yyz-3.1:', process.execPath, rcgm.data);
      GpgCmds.create(rq, [process.execPath, rcgm], [process.execPath, rcgm, 'connect-agent'],
        0, true).match(GpgCmds.match(a => {
          // console.log('Yyz-4:', a.isError(), a.progress);
          // console.log('Yyz-4.1:', a.data);
          gcobs.next(rxme.Msg.Type(a));
          gcobs.complete();
          return true;
        })).passTo(gcobs);
        return true;
    })).passTo(gcobs);
  });
}

const GPGMINVERSION = 2001018;

function possibleGpgCmds(rq: ResultQueue): rxme.Observable[] {
  return [
    GpgCmds.create(rq, ['/usr/bin/gpg'], ['/usr/bin/gpg-connect-agent'], 0),
    GpgCmds.create(rq, ['/usr/bin/gpg2'], ['/usr/bin/gpg-connect-agent'], 1),
    GpgCmds.create(rq, ['/usr/local/bin/gpg'], ['/usr/local/bin/gpg-connect-agent'], 2),
    GpgCmds.create(rq, ['/usr/local/bin/gpg2'], ['/usr/local/bin/gpg-connect-agent'], 3),
    GpgCmds.create(rq, ['../gpg/gnupg/g10/gpg'], ['../gpg/gnupg/tools/gpg-connect-agent'], 4),
    GpgCmds.create(rq, ['/gnupg/g10/gpg'], ['/gnupg/tools/gpg-connect-agent'], 5)
  ];
}

function resolveCmds(obs: rxme.Observer, obsGpgCmds: rxme.Observable[], ret: GpgCmds[]): void {
  // console.log('Yyy-4:');
  if (obsGpgCmds.length == 0) {
    obs.next(rxme.Msg.ArrayOf(ret));
    obs.complete();
    return;
  }
  const work = obsGpgCmds.shift();
  work.match(GpgCmds.match(gpgcmds => {
    ret.push(gpgcmds); // only add valid cmds
    resolveCmds(obs, obsGpgCmds, ret);
    return true;
  })).passTo(obs);
  return;
}

export function internalCreate(rq: ResultQueue, gpgCmds: rxme.Observable[]): rxme.Observable {
  return rxme.Observable.create(obs => {
    gpgCmdMock(rq).match(GpgCmds.match(mock => {
      resolveCmds(obs, gpgCmds, [mock]);
    })).passTo(obs);
  });
}

function _silentCreate(rq: ResultQueue, gpgCmds: rxme.Observable[], title: string): rxme.Observable {
  return rxme.Observable.create(obs => {
    // console.log('Yyx-1:');
    internalCreate(rq, gpgCmds).match(rxme.Matcher.ArrayOf<GpgCmds>(GpgCmds, rc => {
      // console.log('Yyx-2:');
      // const rcgpg = rc.clone<Gpg>();
      if (rc.length > 0) {
        const mock = rc.find(a => a.mock);
        const gcmds = rc.filter(a => !a.mock)
          .sort((a, b) => b.order - a.order)
          .find(a => a.gpg.version.versionNumber() >= GPGMINVERSION) || mock;
        const gmock = Gpg._create(/* mock */);
        gmock.setGpgCmds(gcmds);
        obs.next(rxme.Msg.Type(gmock));
      }
      obs.complete();
    })).passTo(obs);
  });
}

export function create(rq: ResultQueue, gpgCmds: rxme.Observable[] = null,
  title = ''): rxme.Observable {
  if (!gpgCmds) {
    gpgCmds = possibleGpgCmds(rq);
  }
  return rxme.Observable.create(obs => {
    _silentCreate(rq, gpgCmds, title).match(Gpg.match(rsgpg => {
      obs.next(rxme.LogInfo(rsgpg.info(title)));
      obs.next(rxme.Msg.Type(rsgpg));
      obs.complete();
      return true;
    })).match(rxme.Matcher.Error(err => {
      obs.next(rxme.Msg.Error(`Failed to Create GPG:${title}`));
      obs.complete();
    })).passTo(obs);
  });
}

export function createTest(rq: ResultQueue, gpgCmds: rxme.Observable[] = null,
  title = 'Test'): rxme.Observable {
  if (!gpgCmds) {
    gpgCmds = possibleGpgCmds(rq);
  }
  if (process.env.FORCE_MOCK) {
    gpgCmds = [];
  }
  // console.log('Yxx-2:');
  return rxme.Observable.create(obs => {
    // console.log('Yxx-3:');
    _silentCreate(rq, gpgCmds, title).match(Gpg.match(rcgpg => {
      createTempDir(rq, process.cwd(), `${uuid.v4().toString().slice(0, 16)}.tdir`)
        .match(rxme.Matcher.String(rcs => {
        // console.log('Yxx-5:');
        rcgpg.setHomeDir(rcs);
        obs.next(rxme.LogInfo(rcgpg.info(title)));
        obs.next(rxme.Msg.Type(rcgpg));
        obs.complete();
        return true;
      })).passTo(obs);
    })).match(rxme.Matcher.Error(err => {
      obs.next(rxme.Msg.Error(`Failed to Create GPG:${title}`));
      obs.complete();
    })).passTo(obs);
  });
}

export function createMock(rq: ResultQueue): rxme.Observable {
  // console.log('Yxx-1:');
  return createTest(rq, [], 'Mock');
}

export default Gpg;
