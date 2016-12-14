

import {spawn} from 'child_process';
import * as ListSecretKeys from "./list_secret_keys";
import * as CardStatus from "./card_status";
import * as path from "path";
import * as fs from "fs";
//import * as pse from "../pinentry/server";
import * as Ac from "./agent_conf";
import * as stream from 'stream';
import * as Uuid from 'node-uuid';

import * as KeyGen from './key-gen';
import RequestAscii from './request_ascii';

interface StringFunc {
  (): string;
}

type Mixed = string | StringFunc;

export class Result {
    stdOut: string = "";
    stdErr: string = "";
    stdIn: string = "";
    env: { [id:string]: string; } = {};
    exitCode: number;

    constructor() {
        (<any>Object).assign(this.env, process.env);
    }

    setStdIn(stdIn: string) {
        this.stdIn = stdIn;
        return this;
    }

    addEnv(key: string, value: string) {
        this.env[key] = value;
        return this;
    }

    run(cmd: string, attributes: Mixed[], cb: (res: Result) => void) {
      // console.log("run=["+cmd+"]", attributes);
        let fds : (()=>string)[] = [];
        let freeFd = 3;
        let attrs = attributes.map((i) => { if (typeof(i) == "function") {
           fds.push(i);
           return ""+freeFd++;
         }
         return i;
       })
       let writables : string[] = fds.map((func) => {
          // let w = new stream.Writable();
          // let r = new stream.Readable();
          // r.push(func());
          // r.push(null);
          // r.pipe(w);
          // return w;
          return 'pipe'
       });

       let stdio : any[] = ['pipe', 'pipe', 'pipe']
       stdio = stdio.concat(writables);
        // console.log("run=",cmd, attrs);
        const c = spawn(cmd, attrs, {
          env: this.env,
          stdio: stdio
        });
        c.on("error", (e:Event) => {
          console.log(e);
          cb(this);
        });
        if (this.stdIn && this.stdIn.length > 0) {
            var s = new stream.Readable();
            s.push(this.stdIn);
            s.push(null);
            s.pipe(c.stdin);
        }

        // console.log(">>>>>>", stdio.length);
        for (let i = 3; i < stdio.length; ++i) {
          c.stdio[i].on('error', (e:any) => { console.log("stdio->"+i+"->error", e) })
          c.stdio[i].on('end', (e:any) => { console.log("stdio->"+i+"->end", e) })
          var s = new stream.Readable();
            // console.log(">>>>>>", stdio.length, 1, fds[i-3]());
            s.push(fds[i-3]());
            // console.log(">>>>>>", stdio.length, 2);
            s.push(null);
            // console.log(">>>>>>", stdio.length, 3);
            s.pipe(c.stdio[i] as stream.Writable);
            // console.log(">>>>>>", stdio.length, 4);
            s.on('end', () => {
              // console.log(">>>>>>", stdio.length, "closed");
            });
            // s.end();
        }

        c.stdout.on('data', (data: string) => { this.stdOut += data });
        c.stderr.on('data', (data: string) => { this.stdErr += data });
        c.on('close', (code: number) => {
            this.exitCode = code;
            cb(this);
        });
    }
}

export class Gpg {
    homeDir: string = path.join(process.env.HOME, ".gnupg");
    //pinEntryServer: pse.PinEntryServer;
    gpgCmd: string = "gpg2";
    gpgAgentCmd: string = "gpg-connect-agent";

    public setPinentryUrl(url: string) : Gpg {
        return this;
    }
    public setHomeDir(fname: string) : Gpg {
        this.homeDir = fname;
        return this;
    }

    public setGpgCmd(cmd: string) : Gpg {
        this.gpgCmd = cmd;
        return this;
    }

    public started(cb: (s: any) => void) {

    }

    run(attributes: Mixed[], stdIn: string, cb: (res: Result) => void) {
        if (this.homeDir) {
            attributes.splice(0, 0, this.homeDir);
            attributes.splice(0, 0, '--homedir')
        }
        //console.log(attributes);
        let result = (new Result()).setStdIn(stdIn);
        // if (this.pinEntryServer) {
        //     result.addEnv('F_MOD_HOME', "xxx");
        //     result.addEnv('S_PINENTRY_SOCKET', this.pinEntryServer.socketFile);
        // }
        result.run(this.gpgCmd, attributes, cb);
    }

    runAgent(attributes: string[], stdIn: string, cb: (res: Result) => void) {
        console.log(stdIn);
        if (this.homeDir) {
            attributes.splice(0, 0, this.homeDir);
            attributes.splice(0, 0, '--homedir')
        }
        //console.log(attributes);
        let result = (new Result()).setStdIn(stdIn);

        result.run(this.gpgAgentCmd, attributes, cb);
    }

    public resetYubikey(cb: (res: Result) => void) {
      this.runAgent([], this.resetCommand(), cb)
    }

    private resetCommand(){
      return [
        "/hex",
        "scd serialno",
        "scd apdu 00 20 00 81 08 40 40 40 40 40 40 40 40",
        "scd apdu 00 20 00 81 08 40 40 40 40 40 40 40 40",
        "scd apdu 00 20 00 81 08 40 40 40 40 40 40 40 40",
        "scd apdu 00 20 00 81 08 40 40 40 40 40 40 40 40",
        "scd apdu 00 20 00 83 08 40 40 40 40 40 40 40 40",
        "scd apdu 00 20 00 83 08 40 40 40 40 40 40 40 40",
        "scd apdu 00 20 00 83 08 40 40 40 40 40 40 40 40",
        "scd apdu 00 20 00 83 08 40 40 40 40 40 40 40 40",
        "scd apdu 00 e6 00 00",
        "scd apdu 00 44 00 00"].join("\n")
    }

    public list_secret_keys(cb: (err: string, keys: ListSecretKeys.SecretKey[]) => void) {
        this.run(['--list-secret-keys', '--with-colons'], null, (result: Result) => {
            if (result.exitCode != 0) {
                cb("gpg exit with a error code:" + result.exitCode +
                    "\n" + result.stdErr +
                    "\n" + result.stdOut, null);
                return;
            }
            cb(null, ListSecretKeys.run(result.stdOut));
        });
    }

    public card_status(cb: (err: string, keys: CardStatus.Gpg2CardStatus[]) => void) {
        this.run(['--card-status', '--with-colons'], null, (result: Result) => {
            if (result.exitCode != 0) {
                cb("gpg exit with a error code:" + result.exitCode +
                    "\n" + result.stdErr +
                    "\n" + result.stdOut, null);
                return;
            }
            cb(null, CardStatus.run(result.stdOut));
        });
    }


    write_pinentry_sh(fname: string, cb: (err: any) => void) {
        fs.writeFile(fname, [
            '#!' + process.argv[0],
            "let pinentry = require(path.join(process.env.F_MOD_HOME), 'pinentry', 'client'));",
            "pinentry.client(process.env.S_PINENTRY_SOCKET);"
        ].join("\n"), (err) => {
            fs.chmod(fname, 0o755, cb);
        });
    }

    deleteSecretKey(fingerPrint: string, cb: (res: Result) => void) {
      this.run(['--batch', '--yes', '--delete-secret-key', fingerPrint], null, cb);
    }

    deletePublicKey(fingerPrint: string, cb: (res: Result) => void) {
      this.run(['--batch', '--yes', '--delete-key', fingerPrint], null, cb);
    }

    write_agent_conf(pinentryPath: string, cb: (err: any) => void) {
        let gpgAgentFname = path.join(this.homeDir, 'gpg-agent.conf');
        Ac.AgentConf.read_file(gpgAgentFname, (err: any, ag: Ac.AgentConf) => {
            if (err) {
                cb(err);
                return;
            }
            let pp = "pinentry-program";
            let pv = pinentryPath;
            let als = ag.find(pp);
            if (!als) {
                als = [new Ac.AgentLine([pp, pv].join(" "))];
            }
            als.forEach((al: Ac.AgentLine) => { al.value = pv });
            ag.write_file(gpgAgentFname, (err: string) => {
                if (err) {
                    cb(err);
                    return;
                }
                cb(null);
            })
        })
    }

    /*
    public connect_pinentry(cb: (err: string) => void) {
        let pinentryPath = path.join(this.homeDir, 'pinentry.node');
        this.write_pinentry_sh(pinentryPath, (err) => {
            if (err) {
                cb(err);
            }
            this.write_agent_conf(pinentryPath, (err) => {
                let uuid = Uuid.v4();
                let pinentrySocket = path.join(this.homeDir, 'S.pinentry.' + uuid);
                pse.start(pinentrySocket, (err: string, ps: any) => {
                    this.pinEntryServer = ps;
                    cb(err);
                });
            });
        });
    }

    public gen_key(keyGen: KeyGen.KeyGen, cb: (err: string) => void) {
        if (!this.pinEntryServer) {
            cb("need a to run connect_pinentry");
            return;
        }
    }
    */

    public createMasterKey(keyGen: KeyGen.KeyGen, cb: (res: Result) => void) {
      //  '--enable-large-rsa',
      let args : Mixed[] = [
        '--no-tty', '--pinentry-mode', 'loopback',
        '--passphrase-fd',
        () => {
          return keyGen.password.password
        },
        '--full-gen-key',
        '--batch'
      ];
      this.run(args, keyGen.masterCommand(), cb);
    }

    public pemPrivateKey(rqa: RequestAscii, cb: (res: Result) => void) {
      let args = [
        '--no-tty', '--pinentry-mode', 'loopback',
        '--passphrase-fd',
        () => {
          return rqa.passphrase.value
        },
        '-a', '--export-secret-key', rqa.fingerprint
      ];
      this.run(args, null, cb);
    }
    public pemPublicKey(rqa: RequestAscii, cb: (res: Result) => void) {
      this.run(['-a', '--export', rqa.fingerprint], null, cb);
    }
    public pemRevocation(rqa: RequestAscii, cb: (res: Result) => void) {
      this.run(['-a', '--gen-revoke', rqa.fingerprint], null, cb);
    }
    public sshPublic(rqa: RequestAscii, cb: (res: Result) => void) {
      this.run(['--export-ssh-key', rqa.fingerprint], null, cb);
    }

    public addUid(fpr: string, kg: KeyGen.KeyGen, uid: KeyGen.Uid, cb: (res: Result) => void) {
      let args = [
        '--no-tty', '--pinentry-mode', 'loopback',
        '--passphrase-fd',
        () => {
          return kg.password.password
        },
        '--quick-adduid', fpr,
        uid.toString()
      ];
      console.log("addUid", args);
      this.run(args, null, cb);
    }

    public createSubkey(fpr: string, kg: KeyGen.KeyGen, ki: KeyGen.KeyInfo, cb: (res: Result) => void) {
      // gpg2  --quick-addkey  FDCF2566BA8134E3BAD15B7DDDC4941118503075 rsa2048 sign,auth,encr
      // '--enable-large-rsa'
      let args = [
        '--no-tty', '--pinentry-mode', 'loopback',
        '--passphrase-fd',
        () => {
          return kg.password.password
        },
        '--quick-addkey', fpr,
        ki.type.value.toLowerCase()+ki.length.value, ki.usage.values.join(",")
      ];
      console.log("createSubkey", args);
      this.run(args, null, cb);
    }
}
