const path = require('path');
const fs = require('fs');
const request = require('request');
const cachedRequest = require('cached-request')(request)

function resolveUrls(urls, callback) {
  // console.log('resolveUrls', urls);
  Promise.all(urls.map((url, idx) => {
    return new Promise((resolve, reject) => {
      const options = {
        url: url,
        ttl: 3600000 //3 seconds
      };
      cachedRequest(options, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          // console.log(options.url);
          resolve(`// loaded from ${url}\nmodule.exports = ${JSON.stringify({
            url: url,
            body: body.toString()
          })};`);
        }
      });
    })
  }))
    .then((bodies) => callback(null, bodies))
    .catch((error) => callback(error, null));
}

function loader(content) {
  // console.log(path.resolve(__dirname, 'dist'));
  cachedRequest.setCacheDirectory(
    path.join(path.resolve(__dirname), '.dice-req-cache')
  );
  const callback = this.async();
  if (!callback) {
    throw 'there is no sync resolver';
  }
  const urls = content.
    split(/[\n\r]+/).
    map(i => i.replace(/^\s+|\s+$/g, '')).
    filter(i => i.length)
  resolveUrls(urls, (err, resolved) => {
    callback(err, resolved.join('\n'))
  });
}

loader.testLoader = function(stopWebPack) {
  return new Promise((rs, rj) => {
    loader.apply({
      async: () => { return function(_err, js) {
        eval(js);
        rs(module.exports);
      }; },
    }, [fs.readFileSync(require.resolve(stopWebPack)).toString()]);
  });
}

module.exports = loader;

// module.exports.raw = true;

// module.exports.pitch = function(remainingRequest, precedingRequest, data) {
//   console.log('>>>>>>>>>>>>pitch:', remainingRequest, precedingRequest, data);
//   data.value = 42;
// };
