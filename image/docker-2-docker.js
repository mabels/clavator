
const fs = require('fs');
const child_process = require('child_process');
const http = require('http');
const https = require('https');
const dns = require('dns');
const Url = require('url');


function argOffset() {
  let ofs = process.argv.indexOf(__filename);
  if (ofs < 0) {
    ofs = 0;
  }
  return ofs;
}

const docker = process.argv[argOffset() + 1];
const dest = process.argv[argOffset() + 2];
const srcs = process.argv.slice(argOffset() + 3);

//console.log(`extract [${docker}] to [${dest}] from [${srcs.join(",")}]`);

function action(url, options, cb) {
  if (url.startsWith("http://")) {
    //console.log(`using http [${url}]`);
    return http.get(Object.assign(Url.parse(url), options), cb);
  }
  if (url.startsWith("https://")) {
    //console.log(`using https [${url}]`);
    return https.get(Object.assign(Url.parse(url), options), cb);
  }
  if (url.startsWith("file://")) {
    //console.log(`using file [${url}]`);
    cb(fs.createReadStream(url.substr("file://".length)));
    return cb;
  }
  return null;
}

function exec(cmd, args, cb) {
  //console.log(`--->${cmd}`)
  const child = child_process.spawn(cmd, args);
  child.stdout.on('data', (data) => {});
  child.stderr.on('data', (data) => {});
  child.on('error', () => cb(false));
  child.on('close', (code) => {
    cb(code == 0);
  });
}

function dockerPull(src) {
  return (cb) => {
    exec("docker", ['pull', src], (state) => {
      if (!state) {
        cb(false);
        return;
      }
      const docker_split = src.split(/[\/:]+/)
      exec("docker", ["save", "-o", dest, docker_split[docker_split.length-1]], (state) => {
        if (state) {
          console.log(`extracting ${src} to ${dest}`)
          cb(true)
        } else {
          cb(false)
        }
      });
    });
  }
}
function curlFamily(src, family, cb) {
  const file = fs.createWriteStream(`${dest}`);
  const request = action(src, { "family": family }, (response) => {
    console.log(`curlFamily: ${family}:${response.statusCode}:${src}`);
    if (response.statusCode && response.statusCode != 200) {
      //console.error(`HttpStatus:[${response.statusCode}]`);
      return cb(false)
    }
    response.on("error", () => cb(false));
    response.pipe(file);
    response.on("end", () => {
      console.log(`extracting ${src} to ${dest}`)
      cb(true);
    });
  });
  if (request == null) {
    cb(false);
  } else {
    request.on("error", () => {
      console.log(`curlFamily: ${family}:ERR:${src}`);
      cb(false)
    });
  }
}

function curl(src) {
  let families = [true];
  if (src.startsWith("http")) {
    families = [4,6];
  } 
  return function recurse(cb) {
    let family = families.shift();
    if (!family) {
      cb(false);
      return;
    }
    curlFamily(src, family, (mcb) => {
      if (mcb) {
        cb(mcb);
        return;
      } 
      recurse(cb);
    });
  }
}

function getAddressFromUrl(src, cb) {
  const url = Url.parse(src);
  if (!(url && url.protocol && url.protocol.startsWith("http"))) {
    cb([]);
    return;
  }
  let hs = [];
  dns.resolve4(url.hostname, (err, addresses) => {
    if (!err) {
      Array.prototype.push.apply(hs, addresses);
    }
    dns.resolve6(url.hostname, (err, addresses) => {
      if (!err) {
        Array.prototype.push.apply(hs, addresses);
      }
      cb(hs);
    });
  });
}

function addCurl(actions, src, docker) {
  /* 
   * ends !/ starts !/ -> join + join + /
   * ends / starts /   -> remove / join /
   * ends / starts !/  -> remove / join /
   * ends !/ starts /  -> remove / join /
   */
  if (!src.endsWith("/") && !docker.startsWith("/")) {
      actions.push(curl(`${src}${docker}`))
  }
  let ends = src.replace(/[\/]+$/,'');
  let start = docker.replace(/^[\/]+/,'');
  actions.push(curl(`${ends}/${start}`))
}

// try docker pull ${docker}
// try docker pull ${url}${docker}
// try curl ${url}/${docker}
// try curl ${url}/${docker}.docker
let actions = [ dockerPull(docker) ]
srcs.forEach((src) => {
  //getAddressFromUrl(src, (adrs) => {
    //console.log(`getAddressFromUrl:${adrs}`);
    Array.prototype.push.apply(actions, [
      dockerPull(`${src}${docker}`),
      dockerPull(`${src}:${docker}`),
      dockerPull(`${src}/${docker}`),
    ]);
    addCurl(actions, src, docker);
    if (!docker.endsWith(".docker")) {
      addCurl(actions, src, `${docker}.docker`);
    }
  //});
});

function execute(actions, seq) {
  let func = actions.shift();
  if (func == undefined) {
    process.exit(27);
    return;
  }
  func(seq);
}

execute(actions, function seq(ok) {
  if (!ok) {
    execute(actions, seq);
    return;
  }
  process.exit(0);
});
