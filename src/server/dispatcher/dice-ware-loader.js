const path = require('path');
const request = require('request');
const cachedRequest = require('cached-request')(request)

function resolveUrls(urls, callback) {
  Promise.all(urls.map((url, idx) => {
    return new Promise((resolve, reject) => {
      const options = {
        url: url,
        ttl: 7*24*36000000 //one week
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

module.exports = function(content, x) {
  cachedRequest.setCacheDirectory(
    path.join(path.resolve(this.options.output.path), '.dice-req-cache')
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
    callback(err, (resolved || []).join('\n'))
  });
}

// module.exports.raw = true;

// module.exports.pitch = function(remainingRequest, precedingRequest, data) {
//   console.log('>>>>>>>>>>>>pitch:', remainingRequest, precedingRequest, data);
//   data.value = 42;
// };
