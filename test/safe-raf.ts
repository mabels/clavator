import * as Rimraf from 'rimraf';
import * as fs from 'fs';
import * as rxme from 'rxme';

export function safeRaf(dir: string): rxme.Observable<rxme.Done> {
  return rxme.Observable.create(rxme.Done, (obs: rxme.Observer<rxme.Done>) => {
    if (process.env.SKIP_RAF) {
      obs.complete();
      return;
    }
    // console.log(`safeRaf:start:${dir}`);
    fs.stat(dir, (err, dirStat) => {
      if (!err && dir.endsWith('.tdir') && dirStat.isDirectory()) {
        Rimraf(dir, {}, (_err) => {
          if (_err) {
            console.error(`safeRaf failed for:[${dir}]`);
          } else {
            // console.log(`safeRaf:[${dir}]`);
          }
          obs.complete();
        });
      } else {
        console.error(`safeRaf failed for:[${dir}]`);
        obs.complete();
      }
    });
  });
}

export default safeRaf;
