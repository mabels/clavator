import * as path from 'path';
import * as fs from 'fs';
import * as request from 'request';
import { WordList } from './word-list';
const CachedRequest = require('cached-request');

const cachedRequest = CachedRequest(request);

function resolveUrls(urls: string[]): Promise<WordList[]> {
  return Promise.all(
    urls.map((url, idx) => {
      return new Promise<WordList>((resolve, reject) => {
        const options = {
          url: url,
          ttl: 3600000 // 3 seconds
        };
        cachedRequest(options, (error: any, _: Response, body: Buffer) => {
          if (error) {
            reject(error);
          } else {
            // console.log(options.url);
            resolve({
              url: url,
              body: body.toString()
            });
          }
        });
      });
    })
  );
}

export function contentFromUrl(url: string): Promise<string> {
  // console.log(path.resolve(__dirname, 'dist'));
  cachedRequest.setCacheDirectory(
    path.join(path.resolve(__dirname), '.dice-req-cache')
  );
  /*
  const callback = this.async();
  if (!callback) {
    throw 'there is no sync resolver';
  }
  */
  const urls = url
    .split(/[\n\r]+/)
    .map(i => i.replace(/^\s+|\s+$/g, ''))
    .filter(i => i.length);
  return resolveUrls(urls).then(
    r => `
    // loaded from ${url}
    module.exports = ${JSON.stringify(r)}
  `
  );
}

// module.exports.raw = true;

// module.exports.pitch = function(remainingRequest, precedingRequest, data) {
//   console.log('>>>>>>>>>>>>pitch:', remainingRequest, precedingRequest, data);
//   data.value = 42;
// };

export function generator(): Promise<void> {
  return Promise.all(
    [
      path.join(__dirname, './en-large-word-list.url'),
      path.join(__dirname, './de-large-word-list.url')
    ].map(
      f =>
        new Promise((rs, rj) => {
          fs.readFile(f, (err, data) => {
            if (err) {
              rj(err);
            } else {
              rs(data.toString());
            }
          });
        })
    )
  )
    .then(o => o.join('\n'))
    .then(urls => contentFromUrl(urls))
    .then(data => {
      fs.writeFileSync(
        path.join(__dirname, 'dice-ware-word-list-data.js'),
        data
      );
    });
}
