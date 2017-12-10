import GpgMockState from './gpg-mock-state';
import * as yargs from 'yargs';
import * as rxme from 'rxme';
import * as glob from 'glob';
import * as path from 'path';
import * as fs from 'fs';
import { SecretKey } from '../gpg/list-secret-keys';

function quickAddKeyAction(y: yargs.Arguments, state: GpgMockState): rxme.Observable<boolean> {
  return rxme.Observable.create(rxme.Match.BOOLEAN, (obs: rxme.Observer<boolean>) => {
    obs.next(!!y.quickAddkey);
    obs.complete();
  });
}

function searchFingerPrintInFile(fpr: string, y: yargs.Arguments, state: GpgMockState, obs: rxme.Observer<boolean>,
  cb: (fname: string, data: SecretKey, completed: rxme.Observer<string>) => void,
  matches: string[], idx: number): void {
  // console.log('searchFingerPrintInFile:', idx, matches.length);
  if (idx >= matches.length) {
    state.exitCode(0);
    // console.log('Completed:');
    obs.next(true);
    obs.complete();
    return;
  }
  // console.log(matches[idx]);
  fs.readFile(matches[idx], (err, data) => {
    const sk = SecretKey.jsfill(JSON.parse(data.toString('utf8')));
    // console.log(sk.fingerPrint.fpr, fpr, idx, matches);
    if (sk.fingerPrint.fpr.endsWith(fpr)) {
      // console.log('SSH-AAAA');
      rxme.Observable.create(rxme.Match.STRING, (complete: rxme.Observer<string>) => {
        // console.log('SSH-YYYY');
        cb(matches[idx], sk, complete);
      }).matchComplete(() => {
        searchFingerPrintInFile(fpr, y, state, obs, cb, matches, idx + 1);
        return true;
      }).passTo(obs);
    } else {
      searchFingerPrintInFile(fpr, y, state, obs, cb, matches, idx + 1);
    }
  });
}

function searchFingerPrint(fpr: string, y: yargs.Arguments, state: GpgMockState, obs: rxme.Observer<boolean>,
  cb: (fname: string, data: SecretKey, completed: rxme.Observer<string>) => void): void {
  glob(path.join(y.homedir, '*.keyStore.json'), {}, (err, matches) => {
    searchFingerPrintInFile(fpr, y, state, obs, cb, matches, 0);
  });
}

function exportSecretKeyAction(y: yargs.Arguments, state: GpgMockState): rxme.Observable<boolean> {
  // console.log(y);
  return rxme.Observable.create(rxme.Match.BOOLEAN, (obs: rxme.Observer<boolean>) => {
    if (y.exportSecretKey) {
      const unRx = (fname: string, data: SecretKey, completed: rxme.Observer<string>) => {
        state.stdout('-----BEGIN PGP PRIVATE KEY BLOCK-----');
        state.stdout(JSON.stringify(data));
        state.stdout('-----END PGP PRIVATE KEY BLOCK-----');
        completed.complete();
      };
      searchFingerPrint(y.exportSecretKey, y, state, obs, unRx);
    } else {
      obs.next(false);
      obs.complete();
    }
  });
}

function exportAction(y: yargs.Arguments, state: GpgMockState): rxme.Observable<boolean> {
  return rxme.Observable.create((obs: rxme.Observer<boolean>) => {
    if (y.export) {
      const unRx = (fname: string, data: SecretKey, completed: rxme.Observer<string>) => {
        state.stdout('-----BEGIN PGP PUBLIC KEY BLOCK-----');
        state.stdout(JSON.stringify(data));
        state.stdout('-----END PGP PUBLIC KEY BLOCK-----');
        completed.complete();
      };
      searchFingerPrint(y.export, y, state, obs, unRx);
    } else {
      obs.next(false);
      obs.complete();
    }
  });
}

function exportSshKeyAction(y: yargs.Arguments, state: GpgMockState): rxme.Observable<boolean> {
  return rxme.Observable.create((obs: rxme.Observer<boolean>) => {
    if (y.exportSshKey) {
      const unRx = (fname: string, data: SecretKey, completed: rxme.Observer<string>) => {
        // console.log('SSH-XXXX');
        state.stdout(`ssh-rsa ${data.key} ${data.uids[0].email}`);
        completed.complete();
      };
      searchFingerPrint(y.exportSshKey, y, state, obs, unRx);
    } else {
      obs.next(false);
      obs.complete();
    }
  });
}

function deleteSecretKeyAction(y: yargs.Arguments, state: GpgMockState): rxme.Observable<boolean> {
  return rxme.Observable.create((obs: rxme.Observer<boolean>) => {
    if (y.deleteSecretKey) {
      const unRx = (fname: string, data: SecretKey, completed: rxme.Observer<string>) => {
        fs.unlink(fname, nerr => {
          if (nerr) {
            console.error('can not delete file', fname);
          }
          completed.complete();
        });
      };
      searchFingerPrint(y.deleteSecretKey, y, state, obs, unRx);
    } else {
      obs.next(false);
      obs.complete();
    }
  });
}

function deleteKeyAction(y: yargs.Arguments, state: GpgMockState): rxme.Observable<boolean> {
  return rxme.Observable.create((obs: rxme.Observer<boolean>) => {
    obs.next(!!y.deleteKey);
    obs.complete();
  });
}

function parseMimeBlocks(block: string): rxme.Observable<string> {
  return rxme.Observable.create((obs: rxme.Observer<string>) => {
    const begin = /^----[-]+BEGIN [^-]+----[-]+$/;
    const end = /^----[-]+END [^-]+----[-]+$/;
    let state = begin;
    let buffer: string[] = null;
    block.split(/[\n\r]+/).forEach(line => {
      if (state.test(line)) {
        // console.log('found:', state.source, buffer);
        if (!buffer) {
          buffer = [];
          state = end;
        } else {
          obs.next(buffer.join(`\n`));
          buffer = null;
          state = begin;
        }
        return;
      } else if (buffer) {
        buffer.push(line);
      }
    });
    obs.complete();
  });
}

function importAction(y: yargs.Arguments, state: GpgMockState): rxme.Observable<boolean> {
  return rxme.Observable.create((obs: rxme.Observer<boolean>) => {
    if (!y.import) {
      obs.next(false);
      obs.complete();
      return;
    }
    const stdin: string[] = [];
    process.stdin.on('data', (data) => stdin.push(data));
    process.stdin.on('close', () => {
      parseMimeBlocks(stdin.join('')).subscribe(json => {
        // console.log(`[${json}]`);
        try {
          const sk = SecretKey.jsfill(JSON.parse(json));
          state.writeJson(y, `${sk.keyId}.keyStore.json`, sk);
        } catch (e) {
          /* */
        }
      });
      obs.next(true);
      obs.complete();
    });
  });
}

export function cli(y: yargs.Argv, state: GpgMockState): yargs.Argv {
  state.onParsed(importAction);
  state.onParsed(quickAddKeyAction);
  state.onParsed(exportSecretKeyAction);
  state.onParsed(exportAction);
  state.onParsed(exportSshKeyAction);
  state.onParsed(deleteSecretKeyAction);
  state.onParsed(deleteKeyAction);
  return yargs.options({
    'import': { describe: 'import key from stdin', boolean: true },
    'quick-addkey': { describe: 'quick-addkey action', boolean: true },
    'export-secret-key': { describe: 'export secret key', type: 'string' },
    'export': { describe: 'export public key', type: 'string' },
    'export-ssh-key': { describe: 'export ssh public key', type: 'string' },
    'delete-secret-key': { describe: 'delete secret key', type: 'string' },
    'delete-key': { describe: 'delete key', type: 'string' },
  });
}
