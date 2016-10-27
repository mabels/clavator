

import {spawn} from 'child_process';
import * as ListSecretKeys from "./list_secret_keys";
import * as path from "path";
import * as fs from "fs";
import * as pse from "../pinentry/server";
import * as Ac from "./agent_conf";
import * as stream from 'stream';
import * as Uuid from 'node-uuid';

import * as KeyGen from './key-gen';


class Result {
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

    run(cmd: string, attributes: string[], cb: (res: Result) => void) {
      console.log("run=["+cmd+"]", attributes);
        const c = spawn(cmd, attributes, { env: this.env });
        if (this.stdIn && this.stdIn.length > 0) {
            let Readable = stream.Readable;
            var s = new Readable();
            s.push(this.stdIn);
            s.push(null);
            s.pipe(c.stdin);
            // , (ret) => {
            //     console.log(">>>>"+ret+":"+stdIn);
            //     //c.stdin.close();
            //   });
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
    pinEntryServer: pse.PinEntryServer;
    gpgCmd: string = "gpg2";

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

    run(attributes: string[], stdIn: string, cb: (res: Result) => void) {
        if (this.homeDir) {
            attributes.splice(0, 0, this.homeDir);
            attributes.splice(0, 0, '--homedir')
        }
        //console.log(attributes);
        let result = (new Result()).setStdIn(stdIn);
        if (this.pinEntryServer) {
            result.addEnv('F_MOD_HOME', "xxx");
            result.addEnv('S_PINENTRY_SOCKET', this.pinEntryServer.socketFile);
        }
        result.run(this.gpgCmd, attributes, cb);
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

    write_pinentry_sh(fname: string, cb: (err: any) => void) {
        fs.writeFile(fname, [
            '#!' + process.argv[0],
            "let pinentry = require(path.join(process.env.F_MOD_HOME), 'pinentry', 'client'));",
            "pinentry.client(process.env.S_PINENTRY_SOCKET);"
        ].join("\n"), (err) => {
            fs.chmod(fname, 0o755, cb);
        });
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
        this.run(['--full-gen-key', '--batch'], keyGen.command(), (result: Result) => {
            if (result.exitCode != 0) {
                cb("gpg exit with a error code:" + result.exitCode +
                    "\n" + result.stdErr +
                    "\n" + result.stdOut);
                return;
            }
            cb(null);
        });
    }

}
