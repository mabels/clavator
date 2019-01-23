import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as fsPromise from 'fs-extra';
import * as uuid from 'uuid';

// import { CardStatus } from './card-status';
import { AgentConf } from './agent-conf';

import {
  Gpg2CardStatus,
  runCardStatus,
  ChangeCard,
  AgentLine,
  AgentConfType,
  SecretKey,
  runSecretKeys,
  KeyToYubiKey,
  KeyGen,
  KeyInfo,
  RequestChangePin,
  KeyGenUid
} from './types';
import {
  RequestAscii,
  format_date
} from '../model';
import { Result, Mixed } from './result';

export interface GpgCmd {
  cmd: string[];
  cmdAgent: string[];
  agent?: string[];
}

function gpgCmd(gc: GpgCmd): void {
  if (fs.existsSync('/usr/bin/gpg')) {
    gc.cmd = ['/usr/bin/gpg'];
    gc.cmdAgent = ['/usr/bin/gpg-connect-agent'];
  }
  if (fs.existsSync('/usr/bin/gpg2')) {
    gc.cmd = ['/usr/bin/gpg2'];
    gc.cmdAgent = ['/usr/bin/gpg-connect-agent'];
  }
  if (fs.existsSync('/usr/local/bin/gpg')) {
    gc.cmd = ['/usr/local/bin/gpg'];
    gc.cmdAgent = ['/usr/local/bin/gpg-connect-agent'];
  }
  if (fs.existsSync('/usr/local/bin/gpg2')) {
    gc.cmd = ['/usr/local/bin/gpg2'];
    gc.cmdAgent = ['/usr/local/bin/gpg-connect-agent'];
  }
  if (fs.existsSync('../gpg/gnupg/g10/gpg')) {
    gc.cmd = [path.resolve('../gpg/gnupg/g10/gpg')];
    gc.cmdAgent = [path.resolve('../gpg/gnupg/tools/gpg-connect-agent')];
    gc.agent = [path.resolve('../gpg/gnupg/agent/gpg-agent')];
  }
  if (fs.existsSync('/gnupg/g10/gpg')) {
    gc.cmd = ['/gnupg/g10/gpg'];
    gc.cmdAgent = ['/gnupg/tools/gpg-connect-agent'];
    gc.agent = ['/gnupg/agent/gpg-agent'];
  }
}

export interface GpgProps {
  readonly homeDir?: string;
  readonly gpgCmd?: string;
  readonly gpgCmdArgs?: string[];
  readonly gpgAgentCmd?: string;
  readonly gpgAgentCmdArgs?: string[];
  readonly gpgAgent?: string;
  readonly gpgAgentArgs?: string[];
  readonly mockCmd: string[];
  readonly version?: string;
}

export class Gpg {
  public homeDir: string = path.join(process.env.HOME, '.gnupg');
  public version: string;
  // pinEntryServer: pse.PinEntryServer;
  public readonly gpgCmd: string;
  public readonly gpgCmdArgs: string[] = [];
  public readonly gpgAgentCmd: string;
  public readonly gpgAgentCmdArgs: string[] = [];
  public readonly gpgAgent: string;
  public readonly gpgAgentArgs: string[] = [];
  public readonly mockCmd: string[];

  public static _create(mockCmd: string[]): Gpg {
    return new Gpg({ mockCmd });
  }
  public static async create(selectGpgCmd = gpgCmd): Promise<Gpg> {
    const gpg = await internalCreate(selectGpgCmd);
    return gpg;
  }

  private constructor(props: GpgProps) {
    this.gpgCmd = 'gpg2';
    this.gpgAgentCmd = 'gpg-connect-agent';
    this.mockCmd = props.mockCmd;
    this.homeDir = props.homeDir || path.join(process.env.HOME, '.gnupg');
    // pinEntryServer: pse.PinEntryServer;
    this.gpgCmd = props.gpgCmd || 'tbd-gpg';
    this.gpgCmdArgs = props.gpgCmdArgs || [];
    this.gpgAgentCmd = props.gpgAgentCmd;
    this.gpgAgentCmdArgs = props.gpgAgentCmdArgs || [];
    this.gpgAgent = props.gpgAgent;
    this.gpgAgentArgs = props.gpgAgentArgs || [];
    this.version = props.version || 'unkown';
  }

  public clone(): Gpg {
    return new Gpg(this);
  }

  public useMock(): Gpg {
    const mock = this.clone();
    return mock.setGpgCmd(mock.mockCmd)
      .setGpgAgentCmd(mock.mockCmd.concat(['connect-agent']));
  }

  public getVersion(): Promise<string> {
    return new Promise<string>((res, rej) => {
      this.run(['--version'], '', (_res: Result) => {
        const lines = _res.stdOut.split(/[\n\r]+/);
        res(lines[0]);
      });
    });
  }

  public info(): Promise<string> {
    return new Promise<string>(async (res, rej) => {
      if (!this.version) {
        this.version = await this.getVersion();
      }
      res(
        [
          `GpgVersion:[${this.version}]`,
          `Exec:[${[this.gpgCmd].concat(this.gpgCmdArgs).join('][')}]`,
          (this.gpgAgent && `Agent:[${[this.gpgAgent].concat(this.gpgAgentArgs).join('][')}]`),
          `AgentConnect:[${[this.gpgAgentCmd].concat(this.gpgAgentCmdArgs).join('][')}]`,
          `HomeDir:[${this.homeDir}]`
        ].filter(i => i).join(`\n`)
      );
    });
  }

  public setPinentryUrl(url: string): Gpg {
    return this;
  }
  public setHomeDir(fname: string): Gpg {
    this.homeDir = fname;
    return this;
  }

  public getGpgCmd(): string[] {
    return [this.gpgCmd].concat(this.gpgCmdArgs);
  }

  public setGpgCmd(cmd: string[]): Gpg {
    return new Gpg({
      ...this,
      gpgCmd: cmd[0],
      gpgCmdArgs: cmd.slice(1),
    });
  }

  public setGpgAgentCmd(cmd: string[]): Gpg {
    return new Gpg({
      ...this,
      gpgAgentCmd: cmd[0],
      gpgAgentCmdArgs: cmd.slice(1)
    });
  }

  public setGpgAgent(cmd?: string[]): Gpg {
    if (!cmd) {
      return this;
    }
    return new Gpg({
      ...this,
      gpgAgent: cmd[0],
      gpgAgentArgs: cmd.slice(1)
    });
  }

  public started(cb: (s: Result) => void): void {
    this.run(['--print-md', 'md5'], 'test', cb);
  }

  public getSocketName(cb: (sname: string) => void): void {
    // console.log('getSocketName', this);
    this.runAgent(['GETINFO socket_name', '/bye'], null, (res: Result) => {
      if (res.exitCode != 0) {
        // console.log("getSocketName-1:", res);
        cb(null);
        return;
      }
      let line = res.stdOut
        .split(/[\n\r]+/)
        .find(linex => linex.startsWith('D '));
      if (!line) {
        // console.log("getSocketName-2:", line);
        cb(null);
        return;
      }
      cb(line.slice('D '.length));
    });
  }

  public run(
    attributes: Mixed[],
    stdIn: string,
    cb: (res: Result) => void
  ): void {
    if (this.homeDir) {
      attributes.splice(0, 0, this.homeDir);
      attributes.splice(0, 0, '--homedir');
    }
    if (this.gpgAgent) {
      attributes.splice(0, 0, this.gpgAgent);
      attributes.splice(0, 0, '--agent-program');
    }
    // console.log(attributes);
    const result = new Result(this).setStdIn(stdIn);
    // if (this.pinEntryServer) {
    //     result.addEnv('F_MOD_HOME', "xxx");
    //     result.addEnv('S_PINENTRY_SOCKET', this.pinEntryServer.socketFile);
    // }
    result.run(this.gpgCmd, this.gpgCmdArgs, attributes, cb);
  }

  public runAgent(
    attributes: string[],
    stdIn: string,
    cb: (res: Result) => void
  ): void {
    // console.log(stdIn);
    if (this.homeDir) {
      attributes.splice(0, 0, this.homeDir);
      attributes.splice(0, 0, '--homedir');
    }
    // console.log(attributes);
    let result = new Result(this).setStdIn(stdIn);

    console.log('runAgent:', this.gpgAgentCmd, this.gpgAgentCmdArgs, attributes, stdIn);
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
      'scd apdu 00 44 00 00',
      ''
    ].join('\n');
  }

  public getSecretKey(
    fpr: string,
    cb: (key: SecretKey) => void
  ): void {
    this.list_secret_keys((err: string, keys: SecretKey[]) => {
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

  public list_secret_keys(
    cb: (err: string, keys: SecretKey[]) => void
  ): void {
    this.run(
      ['--list-secret-keys', '--with-colons'],
      null,
      (result: Result) => {
        if (result.exitCode != 0) {
          cb(
            'gpg exit with a error code:' +
              result.exitCode +
              '\n' +
              result.stdErr +
              '\n' +
              result.stdOut,
            null
          );
          return;
        }
        cb(null, runSecretKeys(result.stdOut));
      }
    );
  }

  public card_status(
    cb: (err: string, keys: Gpg2CardStatus[]) => void
  ): void {
    this.run(['--card-status', '--with-colons'], null, (result: Result) => {
      if (result.exitCode != 0) {
        cb(
          'gpg exit with a error code:' +
            result.exitCode +
            '\n' +
            result.stdErr +
            '\n' +
            result.stdOut,
          null
        );
        return;
      }
      cb(null, runCardStatus(result.stdOut));
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
    let args: Mixed[] = ['--no-tty'];
    this.getSecretKey(fingerPrint, key => {
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
      args.push(
        '--expert',
        '--batch',
        '--yes',
        '--delete-secret-key',
        fingerPrint
      );
      // console.log('deleteSecretKey:', args);
      this.run(args, null, cb);
    });
  }

  public deletePublicKey(fingerPrint: string, cb: (res: Result) => void): void {
    this.run(['--batch', '--delete-key', fingerPrint], null, cb);
  }

  public write_agent_conf(pinentryPath: string, cb: (err: any) => void): void {
    let gpgAgentFname = path.join(this.homeDir, 'gpg-agent.conf');
    AgentConf.read_file(gpgAgentFname, (err: any, ag: AgentConfType) => {
      if (err) {
        cb(err);
        return;
      }
      let pp = 'pinentry-program';
      let pv = pinentryPath;
      let als = ag.find(pp);
      if (!als) {
        als = [new AgentLine([pp, pv].join(' '))];
      }
      als.forEach((al: AgentLine) => {
        al.value = pv;
      });
      ag.write_file(gpgAgentFname, (errx: string) => {
        if (errx) {
          cb(errx);
          return;
        }
        cb(null);
      });
    });
  }

  public createMasterKey(
    keyGen: KeyGen,
    cb: (res: Result) => void
  ): void {
    //  '--enable-large-rsa',
    let args: Mixed[] = [
      '--no-tty',
      '--pinentry-mode',
      'loopback',
      '--passphrase-fd',
      () => {
        return keyGen.password.value + '\n';
      },
      '--passphrase-fd',
      () => {
        return keyGen.password.value + '\n';
      },
      '--full-gen-key',
      '--batch'
    ];
    // console.log('createMasterKey:', this.gpgCmd, this.gpgCmdArgs, args, keyGen.masterCommand());
    this.run(args, keyGen.masterCommand(), cb);
  }

  public pemPrivateKey(rqa: RequestAscii, cb: (res: Result) => void): void {
    let args = [
      '--no-tty',
      '--pinentry-mode',
      'loopback',
      '--passphrase-fd',
      () => {
        return rqa.passphrase.value + '\n';
      },
      '-a',
      '--export-secret-key',
      rqa.fingerprint
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

  public addUid(
    fpr: string,
    kg: KeyGen,
    uid: KeyGenUid,
    cb: (res: Result) => void
  ): void {
    let args = [
      '--no-tty',
      '--pinentry-mode',
      'loopback',
      '--passphrase-fd',
      () => {
        return kg.password.value;
      },
      '--quick-adduid',
      fpr,
      uid.toString()
    ];
    console.log('addUid', args);
    this.run(args, null, cb);
  }

  public createSubkey(
    fpr: string,
    kg: KeyGen,
    ki: KeyInfo,
    cb: (res: Result) => void
  ): void {
    // gpg2  --quick-addkey  FDCF2566BA8134E3BAD15B7DDDC4941118503075 rsa2048 sign,auth,encr
    // '--enable-large-rsa'
    let args = [
      '--no-tty',
      '--pinentry-mode',
      'loopback',
      '--passphrase-fd',
      () => {
        return kg.password.value + '\n';
      },
      '--quick-addkey',
      fpr,
      ki.type.value.toLowerCase() + ki.length.value,
      ki.usage.values.join(','),
      format_date(kg.expireDate.value)
    ];
    // console.log('createSubkey', args);
    this.run(args, null, cb);
  }

  public changePin(
    type: string,
    rcp: RequestChangePin,
    cb: (res: Result) => void
  ): void {
    let args = [
      '--no-tty',
      '--pinentry-mode',
      'loopback',
      '--passphrase-fd',
      () => {
        return rcp.admin_pin.pin + '\n';
      },
      '--passphrase-fd',
      () => {
        return rcp.new_pin.pin + '\n';
      },
      '--passphrase-fd',
      () => {
        return rcp.new_pin_verify.pin + '\n';
      },
      '--change-pin',
      type,
      rcp.app_id
    ];
    console.log('changePin:', args);
    this.run(args, null, cb);
  }

  private getSocketNames(
    g1: Gpg,
    g2: Gpg,
    cb: (res: Result, s1?: string, s2?: string) => void
  ): void {
    g1.getSocketName(sName1 => {
      if (sName1 == null) {
        let res = new Result(this);
        res.exitCode = 47;
        res.stdErr = `can't retrieve socketName:${sName1}`;
        cb(res);
        return;
      }
      g2.getSocketName(sName2 => {
        if (sName2 == null) {
          let res = new Result(this);
          res.exitCode = 48;
          res.stdErr = `can't retrieve socketName:${sName2}`;
          cb(res);
          return;
        }
        cb(null, sName1, sName2);
      });
    });
  }

  public importSecretKey(
    ktyk: KeyToYubiKey,
    pem: string,
    cb: (res: Result) => void
  ): void {
    let args = [
      '--pinentry-mode',
      'loopback',
      '--passphrase-fd',
      () => {
        return ktyk.passphrase.value + '\n';
      },
      '--import'
    ];
    this.run(args, pem, (pre: Result) => {
      cb(pre);
    });
  }

  public prepareKeyToYubiKey(
    ktyk: KeyToYubiKey,
    cb: (gpgYubiKey: Gpg, res: Result) => void
  ): void {
    const rqa = new RequestAscii({
      fingerprint: ktyk.fingerprint,
      passphrase: ktyk.passphrase.value,
    });
    console.log('prepareKeyToYubiKey:1', this);
    this.pemPrivateKey(rqa, async (res: Result) => {
      console.log('prepareKeyToYubiKey:2', res.exitCode);
      if (res.exitCode != 0) {
        cb(null, res);
        return;
      }
      let gpgSmartCard = this.clone();
      const homedir = path.join(
        process.cwd(),
        `${uuid
          .v4()
          .toString()
          .slice(0, 16)}.ctr`
      );
      console.log('keyToYubiKey:', homedir, gpgSmartCard);
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
      console.log('keyToYubiKey:1:', homedir);
      gpgSmartCard.importSecretKey(ktyk, res.stdOut, (ires: Result) => {
        console.log('keyToYubiKey:2:', ires.exitCode);
        if (ires.exitCode != 0) {
          cb(null, ires);
          return;
        }
        console.log('keyToYubiKey:2:');
        this.getSocketNames(this, gpgSmartCard,
          (sres: Result, s1: string, s2: string) => {
            console.log('keyToYubiKey:3:', s1, s2);
            if (sres) {
              cb(null, sres);
              return;
            }
            console.log('keyToYubiKey:4:');
            gpgSmartCard.runAgent(
              ['killagent', '/bye'],
              null,
              async (ares: Result) => {
                console.log('keyToYubiKey:5:');
                if (ares.exitCode != 0) {
                  cb(null, ares);
                  return;
                }
                console.log('keyToYubiKey:6:');
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
              }
            );
          }
        );
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
      const args = [
        '--pinentry-mode',
        'loopback',
        '--passphrase-fd',
        () => {
          console.log('>>keyToYubiKey:passphrase[', ktyk.passphrase.value, ']');
          return ktyk.passphrase.value + '\n';
        },
        '--passphrase-fd',
        () => {
          console.log('>>keyToYubiKey:admin[', ktyk.admin_pin.pin, ']');
          return ktyk.admin_pin.pin + '\n';
        },
        '--quick-keytocard',
        ktyk.fingerprint,
        '' + ktyk.slot_id,
        ktyk.card_id
      ];
      console.log('keyToYubiKey', args);
      gpgYubiKey.run(args, null, (resx: Result) => {
        if (resx.exitCode == 0) {
          // console.error('keyToYubiKey:error:', resx);
          rimraf.sync(gpgYubiKey.homeDir);
        }
        console.log('keyToYubikey:transaction', resx.exitCode, resx.stdOut, res.stdErr);
        cb(resx);
      });
    });
  }

  public changeCard(cc: ChangeCard, cb: (res: Result) => void): void {
    let sname = cc.name.get().split(/\s+/);
    let actions = [
      ['name', [sname.slice(1).join(' '), sname[0]]],
      ['language', [cc.lang.get()]],
      ['sex', [cc.sex.get()[0] == 'f' ? 2 : 1]],
      ['login', [cc.login.get()]],
      ['url', [cc.url.get()]]
    ];
    this._changeCard(cc, actions, cb, []);
  }
  private _changeCard(
    cc: ChangeCard,
    actions: any[],
    cb: (res: Result) => void,
    results: Result[]
  ): void {
    if (actions.length == 0) {
      let res = new Result(this);
      results.forEach(r => {
        res.exitCode += r.exitCode;
        res.stdErr += r.stdErr;
        res.stdOut += r.stdOut;
      });
      cb(res);
      return;
    }
    let current = actions.shift();
    console.log('current:', current);
    this.changeAttribute(
      cc.adminPin.pin,
      current[0],
      current[1],
      cc.serialNo.get(),
      res => {
        results.push(res);
        this._changeCard(cc, actions, cb, results);
      }
    );
  }

  private changeAttribute(
    adminPin: string,
    attrName: string,
    value: string[],
    serialNo: string,
    cb: (res: Result) => void
  ): void {
    // create copy of the selected key to avoid
    // that this key will removed from the current
    // key database
    let args = [
      '--pinentry-mode',
      'loopback',
      '--passphrase-fd',
      () => {
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

function findGpgMock(): Promise<string[]> {
  let dirname: string;
  let pname = 'gpg-mock';
  let execPath = process.execPath;
  if (process.env.PACKED === 'true') {
    dirname = __filename;
  } else {
    pname = 'index';
    dirname = path.join(__dirname, '../gpg-mock/index');
    execPath = 'ts-node';
  }
  // console.log('findGpgMock:Init', pname, dirname);
  let gm = '';
  let prevDirname = '';
  return new Promise<string[]>(async (res, rej) => {
    let gmExists = false;
    do {
      prevDirname = dirname;
      dirname = path.dirname(dirname);
      gm = require.resolve(path.join(dirname, pname));
      // console.log('findGpgMock:GM:', dirname, pname, gm);
      gmExists = await fsPromise.pathExists(gm);
    } while (prevDirname != dirname && !gmExists);
    // console.log('findGpgMock:', __filename, execPath, gm);
    res([execPath, gm]);
  });
}

export async function internalCreate(
  selectGpgCmd: (gc: GpgCmd) => void
): Promise<Gpg> {
  return new Promise<Gpg>(async (res, rej) => {
    const mockCmd = await findGpgMock();
    const gpgcmd: GpgCmd = {
      cmd: mockCmd,
      cmdAgent: mockCmd.concat(['connect-agent'])
    };
    selectGpgCmd(gpgcmd);
    // console.log(`internalCreate:`, mockCmd, gpgCmd);
    let gpg = Gpg._create(mockCmd);
    gpg = gpg.setGpgCmd(gpgcmd.cmd);
    gpg = gpg.setGpgAgentCmd(gpgcmd.cmdAgent);
    gpg = gpg.setGpgAgent(gpgcmd.agent);
    res(gpg);
  });
}

export function createTest(
  selectGpgCmd = gpgCmd,
  title = 'Test'
): Promise<Gpg> {
  return new Promise<Gpg>(async (res, _rej) => {
    const gpg = await internalCreate(selectGpgCmd);
    const homedir = path.join(
      process.cwd(),
      `${uuid
        .v4()
        .toString()
        .slice(0, 16)}.tdir`
    );
    gpg.setHomeDir(homedir);
    await fsPromise.mkdirSync(homedir);
    const gi = await gpg.info();
    console.log(`Created ${title} Gpg:`, gi);
    res(gpg);
  });
}

export function createMock(): Promise<Gpg> {
  return createTest(() => {
    /* */
  }, 'Mock');
}
