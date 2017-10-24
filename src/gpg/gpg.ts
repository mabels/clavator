
import { spawn } from 'child_process';
import * as ListSecretKeys from './list_secret_keys';
import * as CardStatus from './card_status';
import * as path from 'path';
// import * as fs from 'fs';
// import * as fsPromise from "fs-promise";
import * as fsPromise from 'fs-extra';
// import * as pse from "../pinentry/server";
import * as Ac from './agent_conf';
import * as stream from 'stream';
import * as Uuid from 'node-uuid';

import KeyToYubiKey from './key-to-yubikey';

import * as KeyGen from './key-gen';
import ChangeCard from './change_card';
import RequestAscii from './request_ascii';
import RequestChangePin from './request_change_pin';
import KeyGenUid from './key-gen-uid';
import { format_date } from './helper';

import * as rimraf from 'rimraf';

interface StringFunc {
  (): string;
}

type Mixed = string | StringFunc;

class ResultQueue {
  public cmd: string;
  public attributes: Mixed[];
  public cb: (res: Result) => void;
}

export class Result {
  public stdOut: string;
  public stdErr: string;
  public stdIn: string;
  public env: { [id: string]: string; } = {};
  public exitCode: number;
  public runQueue: ResultQueue[] = [];

  constructor() {
    (<any>Object).assign(this.env, process.env);
    this.stdIn = '';
    this.stdOut = '';
    this.stdErr = '';
  }

  public setStdIn(stdIn: string): Result {
    this.stdIn = stdIn;
    return this;
  }

  public addEnv(key: string, value: string): Result {
    this.env[key] = value;
    return this;
  }

  public run(cmd: string, cmdArgs: Mixed[], attributes: Mixed[], cb: (res: Result) => void): void {
    let args = cmdArgs.concat(attributes);
    this.runQueue.push({cmd: cmd, attributes: args, cb: cb});
    if (this.runQueue.length == 1) {
      this._run(cmd, args, cb);
    }
  }
  public processQueue(): void {
    this.runQueue.shift();
    if (this.runQueue.length > 0) {
      let head = this.runQueue[0];
      this._run(head.cmd, head.attributes, head.cb);
    }
  }
  private _run(cmd: string, attributes: Mixed[], cb: (res: Result) => void): void {
    // console.log("run=["+cmd+"]", attributes);
    let fds: (() => string)[] = [];
    let freeFd = 3;
    let attrs = attributes.map((i) => {
      if (typeof (i) == 'function') {
        fds.push(i);
        return '' + freeFd++;
      }
      return i;
    });
    let writables: string[] = fds.map((func) => {
      return 'pipe';
    });

    let stdio: any[] = ['pipe', 'pipe', 'pipe'];
    stdio = stdio.concat(writables);
    // console.log("run=",cmd, attrs);
    const c = spawn(cmd, attrs, {
      env: this.env,
      stdio: stdio
    });
    c.on('error', (e: Event) => {
      console.log(e);
      cb(this);
      this.processQueue();
    });
    if (this.stdIn && this.stdIn.length > 0) {
      let s = new stream.Readable();
      s.push(this.stdIn);
      s.push(null);
      s.pipe(c.stdin);
    }

    // console.log(">>>>>>", stdio.length);
    for (let j = 3; j < stdio.length; ++j) {
      ((i) => {
        let s_closed = false;
        c.stdio[i].on('error', (e: any) => {
          if (!s_closed) {
            console.error('stdio->' + i + '->error', e);
          }
        });
        c.stdio[i].on('end', (e: any) => { /*console.log("stdio->"+i+"->end", e) */ });
        let s = new stream.Readable();
        // console.log(">>>>>>", stdio.length, 1, fds[i-3]());
        s.push(fds[i - 3]());
        // console.log(">>>>>>", stdio.length, 2);
        s.push(null);
        // console.log(">>>>>>", stdio.length, 3);
        s.pipe(c.stdio[i] as stream.Writable, { end: true });
        // console.log(">>>>>>", stdio.length, 4);
        s.on('end', () => {
          s_closed = true;
          // console.log("s.end:", i);
        });
      })(j);
    }

    c.stdout.on('data', (data: string) => { this.stdOut += data; });
    c.stderr.on('data', (data: string) => { this.stdErr += data; });
    c.on('close', (code: number) => {
      this.exitCode = code;
      cb(this);
      this.processQueue();
    });
  }
}

export class Gpg {
  public homeDir: string = path.join(process.env.HOME, '.gnupg');
  // pinEntryServer: pse.PinEntryServer;
  public gpgCmd: string;
  public gpgCmdArgs: string[] = [];
  public gpgAgentCmd: string;
  public gpgAgentCmdArgs: string[] = [];

  constructor() {
    this.gpgCmd = 'gpg2';
    this.gpgAgentCmd = 'gpg-connect-agent';
  }

  public clone(): Gpg {
    let ret = new Gpg();
    ret.homeDir = this.homeDir;
    ret.gpgCmd = this.gpgCmd;
    ret.gpgCmdArgs = this.gpgCmdArgs;
    ret.gpgAgentCmd = this.gpgAgentCmd;
    ret.gpgAgentCmdArgs = this.gpgAgentCmdArgs;
    return ret;
  }

  public setPinentryUrl(url: string): Gpg {
    return this;
  }
  public setHomeDir(fname: string): Gpg {
    this.homeDir = fname;
    return this;
  }

  public setGpgCmd(cmd: string[]): Gpg {
    this.gpgCmd = cmd[0];
    this.gpgCmdArgs = cmd.slice(1);
    return this;
  }

  public setGpgAgentCmd(cmd: string[]): Gpg {
    this.gpgAgentCmd = cmd[0];
    this.gpgAgentCmdArgs = cmd.slice(1);
    return this;
  }

  public started(cb: (s: Result) => void): void {
    this.run(['--print-md', 'md5'], 'test', cb);
  }

  public getSocketName(cb: (sname: string) => void): void {
    this.runAgent(['GETINFO socket_name', '/bye'], null, (res: Result) => {
      if (res.exitCode != 0) {
        // console.log("getSocketName-1:", res);
        cb(null);
        return;
      }
      let line = res.stdOut.split(/[\n\r]+/).find((linex) => linex.startsWith('D '));
      if (!line) {
        // console.log("getSocketName-2:", line);
        cb(null);
        return;
      }
      cb(line.slice('D '.length));
    });
  }

  public run(attributes: Mixed[], stdIn: string, cb: (res: Result) => void): void {
    if (this.homeDir) {
      attributes.splice(0, 0, this.homeDir);
      attributes.splice(0, 0, '--homedir');
    }
    // console.log(attributes);
    let result = (new Result()).setStdIn(stdIn);
    // if (this.pinEntryServer) {
    //     result.addEnv('F_MOD_HOME', "xxx");
    //     result.addEnv('S_PINENTRY_SOCKET', this.pinEntryServer.socketFile);
    // }
    result.run(this.gpgCmd, this.gpgCmdArgs, attributes, cb);
  }

  public runAgent(attributes: string[], stdIn: string, cb: (res: Result) => void): void {
    // console.log(stdIn);
    if (this.homeDir) {
      attributes.splice(0, 0, this.homeDir);
      attributes.splice(0, 0, '--homedir');
    }
    // console.log(attributes);
    let result = (new Result()).setStdIn(stdIn);

    console.log(this.gpgAgentCmd, attributes, stdIn);
    result.run(this.gpgAgentCmd, this.gpgAgentCmdArgs, attributes, cb);
  }

  public resetYubikey(cb: (res: Result) => void): void {
    this.runAgent([], this.resetCommand(), cb);
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
      'scd apdu 00 44 00 00', ''].join('\n');
  }

  public getSecretKey(fpr: string, cb: (key: ListSecretKeys.SecretKey) => void): void {
    this.list_secret_keys((err: string, keys: ListSecretKeys.SecretKey[]) => {
      if (err) {
        cb(null);
        return;
      }
      let found = false;
      for (let key of keys) {
        if (key.fingerPrint.fpr == fpr) {
          cb(key);
          return;
        }
      }
      if (!found) {
        cb(null);
      }
    });
  }

  public list_secret_keys(cb: (err: string, keys: ListSecretKeys.SecretKey[]) => void): void {
    this.run(['--list-secret-keys', '--with-colons'], null, (result: Result) => {
      if (result.exitCode != 0) {
        cb('gpg exit with a error code:' + result.exitCode +
          '\n' + result.stdErr +
          '\n' + result.stdOut, null);
        return;
      }
      cb(null, ListSecretKeys.run(result.stdOut));
    });
  }

  public card_status(cb: (err: string, keys: CardStatus.Gpg2CardStatus[]) => void): void {
    this.run(['--card-status', '--with-colons'], null, (result: Result) => {
      if (result.exitCode != 0) {
        cb('gpg exit with a error code:' + result.exitCode +
          '\n' + result.stdErr +
          '\n' + result.stdOut, null);
        return;
      }
      cb(null, CardStatus.run(result.stdOut));
    });
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

  public deleteSecretKey(fingerPrint: string, cb: (res: Result) => void): void {
    let args: Mixed[] = [ '--no-tty' ];
    this.getSecretKey(fingerPrint, (key) => {
      if (!key) {
        cb(null);
        return;
      }
      // for (let i = 0; i < 1 + key.subKeys.length; ++i) {
      //   args.push('--passphrase-fd', () => {
      //     console.log("--passphrase-fd y");
      //     return "j\n";
      //   });
      // }
      args.push('--expert', '--batch', '--yes', '--delete-secret-key', fingerPrint);
      console.log('deleteSecretKey:', args);
      this.run(args, null, cb);
    });
  }

  public deletePublicKey(fingerPrint: string, cb: (res: Result) => void): void {
    this.run(['--batch', '--delete-key', fingerPrint], null, cb);
  }

  public write_agent_conf(pinentryPath: string, cb: (err: any) => void): void {
    let gpgAgentFname = path.join(this.homeDir, 'gpg-agent.conf');
    Ac.AgentConf.read_file(gpgAgentFname, (err: any, ag: Ac.AgentConf) => {
      if (err) {
        cb(err);
        return;
      }
      let pp = 'pinentry-program';
      let pv = pinentryPath;
      let als = ag.find(pp);
      if (!als) {
        als = [new Ac.AgentLine([pp, pv].join(' '))];
      }
      als.forEach((al: Ac.AgentLine) => { al.value = pv; });
      ag.write_file(gpgAgentFname, (errx: string) => {
        if (errx) {
          cb(errx);
          return;
        }
        cb(null);
      });
    });
  }

  public createMasterKey(keyGen: KeyGen.KeyGen, cb: (res: Result) => void): void {
    //  '--enable-large-rsa',
    let args: Mixed[] = [
      '--no-tty', '--pinentry-mode', 'loopback',
      '--passphrase-fd',
      () => {
        return keyGen.password.password + '\n';
      },
      '--passphrase-fd',
      () => {
        return keyGen.password.password + '\n';
      },
      '--full-gen-key',
      '--batch'
    ];
    console.log('createMasterKey:', this.gpgCmd, this.gpgCmdArgs, args);
    this.run(args, keyGen.masterCommand(), cb);
  }

  public pemPrivateKey(rqa: RequestAscii, cb: (res: Result) => void): void {
    let args = [
      '--no-tty', '--pinentry-mode', 'loopback',
      '--passphrase-fd',
      () => {
        return rqa.passphrase.value + '\n';
      },
      '-a', '--export-secret-key', rqa.fingerprint
    ];
    console.log('pemPrivateKey:', this.homeDir);
    this.run(args, null, cb);
  }
  public pemPublicKey(rqa: RequestAscii, cb: (res: Result) => void): void {
    this.run(['-a', '--export', rqa.fingerprint], null, cb);
  }
  public pemRevocation(rqa: RequestAscii, cb: (res: Result) => void): void {
    this.run(['-a', '--gen-revoke', rqa.fingerprint], null, cb);
  }
  public sshPublic(rqa: RequestAscii, cb: (res: Result) => void): void {
    this.run(['--export-ssh-key', rqa.fingerprint], null, cb);
  }

  public addUid(fpr: string, kg: KeyGen.KeyGen, uid: KeyGenUid, cb: (res: Result) => void): void {
    let args = [
      '--no-tty', '--pinentry-mode', 'loopback',
      '--passphrase-fd',
      () => {
        return kg.password.password;
      },
      '--quick-adduid', fpr,
      uid.toString()
    ];
    console.log('addUid', args);
    this.run(args, null, cb);
  }

  public createSubkey(fpr: string, kg: KeyGen.KeyGen, ki: KeyGen.KeyInfo, cb: (res: Result) => void): void {
    // gpg2  --quick-addkey  FDCF2566BA8134E3BAD15B7DDDC4941118503075 rsa2048 sign,auth,encr
    // '--enable-large-rsa'
    let args = [
      '--no-tty', '--pinentry-mode', 'loopback',
      '--passphrase-fd',
      () => {
        return kg.password.password + '\n';
      },
      '--quick-addkey', fpr,
      ki.type.value.toLowerCase() + ki.length.value, ki.usage.values.join(','),
      format_date(kg.expireDate.value)
    ];
    console.log('createSubkey', args);
    this.run(args, null, cb);
  }

  public changePin(type: string, rcp: RequestChangePin, cb: (res: Result) => void): void {
    let args = [
      '--no-tty', '--pinentry-mode', 'loopback',
      '--passphrase-fd', () => {
        return rcp.admin_pin.pin + '\n';
      },
      '--passphrase-fd', () => {
        return rcp.new_pin.pin + '\n';
      },
      '--passphrase-fd', () => {
        return rcp.new_pin_verify.pin + '\n';
      },
      '--change-pin', type, rcp.app_id
    ];
    console.log('changePin:', args);
    this.run(args, null, cb);
  }

  private getSocketNames(g1: Gpg, g2: Gpg, cb: (res: Result, s1?: string, s2?: string) => void): void {
    g1.getSocketName((sName1) => {
      if (sName1 == null) {
        let res = new Result();
        res.exitCode = 47;
        res.stdErr = `can't retrieve socketName:${sName1}`;
        cb(res);
        return;
      }
      g2.getSocketName((sName2) => {
        if (sName2 == null) {
          let res = new Result();
          res.exitCode = 48;
          res.stdErr = `can't retrieve socketName:${sName2}`;
          cb(res);
          return;
        }
        cb(null, sName1, sName2);
      });
    });
  }

  public importSecretKey(ktyk: KeyToYubiKey, pem: string, cb: (res: Result) => void): void {
    let args = [
      '--pinentry-mode', 'loopback',
      '--passphrase-fd', () => {
        return ktyk.passphrase.value + '\n';
      },
      '--import'
    ];
    this.run(args, pem, (pre: Result) => {
      cb(pre);
    });
  }

  public prepareKeyToYubiKey(ktyk: KeyToYubiKey, cb: (gpgYubiKey: Gpg, res: Result) => void): void {
    let rqa = new RequestAscii();
    rqa.fingerprint = ktyk.fingerprint;
    rqa.passphrase = ktyk.passphrase;
    this.pemPrivateKey(rqa, async (res: Result) => {
      if (res.exitCode != 0) {
        cb(null, res);
        return;
      }
      let gpgSmartCard = this.clone();
      let homedir = path.join(process.cwd(), `${Uuid.v4().toString().slice(0, 16)}.ctr`);
      console.log('keyToYubiKey:', homedir);
      gpgSmartCard.setHomeDir(homedir);
      try {
        await fsPromise.mkdir(homedir);
        await fsPromise.chmod(homedir, 0o700);
      } catch (e) {
        res.exitCode = 42;
        res.stdErr = e;
        cb(null, res);
        return;
      }
      gpgSmartCard.importSecretKey(ktyk, res.stdOut, (ires: Result) => {
        if (ires.exitCode != 0) {
          cb(null, ires);
        }
        this.getSocketNames(this, gpgSmartCard, (sres: Result, s1: string, s2: string) => {
          if (sres) {
            cb(null, sres);
            return;
          }
          gpgSmartCard.runAgent(['killagent', '/bye'], null, async (ares: Result) => {
            if (ares.exitCode != 0) {
              cb(null, ares);
              return;
            }
            try {
              if (s1 != s2) {
                try {
                  await fsPromise.ensureFile(s2);
                  await fsPromise.unlink(s2);
                  await fsPromise.symlink(s1, s2);
                } catch (e) {
                  // nothing
                }
              }
              console.log('killed:', s1, s2);
              cb(gpgSmartCard, ares);
            } catch (e) {
              console.log(e);
              ares.exitCode = 43;
              ares.stdErr = e;
              cb(null, ares);
              return;
            }
          });
        });
      });
    });
  }

  public keyToYubiKey(ktyk: KeyToYubiKey, cb: (res: Result) => void): void {
    // create copy of the selected key to avoid
    // that this key will removed from the current
    // key database
    this.prepareKeyToYubiKey(ktyk, (gpgYubiKey: Gpg, res: Result) => {
      if (res.exitCode != 0) {
        cb(res);
        return;
      }
      let args = [
        '--pinentry-mode', 'loopback',
        '--passphrase-fd', () => {
          // console.log(">>keyToYubiKey:passphrase[", ktyk.passphrase.value, "]")
          return ktyk.passphrase.value; // + "\n"
        },
        '--passphrase-fd', () => {
          // console.log(">>keyToYubiKey:admin[", ktyk.admin_pin.pin, "]")
          return ktyk.admin_pin.pin; // + "\n"
        },
        '--quick-keytocard',
        ktyk.fingerprint,
        '' + ktyk.slot_id, ktyk.card_id
      ];
      console.log('keyToYubiKey', args);
      gpgYubiKey.run(args, null, (resx: Result) => {
        if (resx.exitCode == 0) {
          rimraf.sync(gpgYubiKey.homeDir);
        }
        cb(resx);
      });
    });
  }

  public changeCard(cc: ChangeCard, cb: (res: Result) => void): void {
    let sname = cc.name.split(/\s+/);
    let actions = [
      [ 'name', [ sname.slice(1).join(' '), sname[0] ] ],
      [ 'language', [cc.lang] ],
      [ 'sex', [ cc.sex[0] == 'f' ? 2 : 1 ] ],
      [ 'login', [cc.login] ],
      [ 'url', [cc.url] ]
    ];
    this._changeCard(cc, actions, cb, []);
  }
  private _changeCard(cc: ChangeCard, actions: any[], cb: (res: Result) => void, results: Result[]): void {
    if (actions.length == 0) {
      let res = new Result();
      results.forEach((r) => {
        res.exitCode += r.exitCode;
        res.stdErr += r.stdErr;
        res.stdOut += r.stdOut;
      });
      cb(res);
      return;
    }
    let current = actions.shift();
    console.log('current:', current);
    this.changeAttribute(cc.adminPin.pin, current[0], current[1], cc.serialNo, (res) => {
      results.push(res);
      this._changeCard(cc, actions, cb, results);
    });
  }

  private changeAttribute(adminPin: string, attrName: string,
    value: string[], serialNo: string, cb: (res: Result) => void): void {
    // create copy of the selected key to avoid
    // that this key will removed from the current
    // key database
    let args = [
      '--pinentry-mode', 'loopback',
      '--passphrase-fd', () => {
        // console.log(">>keyToYubiKey:passphrase[", ktyk.passphrase.value, "]")
        return adminPin; // + "\n"
      },
      '--change-card',
      attrName
    ];
    args = args.concat(value);
    args.push(serialNo);
    console.log('changeCard', args);
    this.run(args, null, cb);
  }

}
