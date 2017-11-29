import * as Rimraf from 'rimraf';
import * as fs from 'fs';
import * as rx from 'rxjs';
import { dirname } from 'path';

export function safeRaf(dir: string): rx.Observable<void> {
  return rx.Observable.create((obs: rx.Observer<void>) => {
    console.log(`safeRaf:start:${dir}`);
    fs.stat(dir, (err, dirStat) => {
      if (!err && dir.endsWith('.tdir') && dirStat.isDirectory()) {
        Rimraf(dir, {}, (_err) => {
          if (_err) {
            console.error(`safeRaf failed for:[${dir}]`);
          } else {
            console.log(`safeRaf:[${dir}]`);
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
