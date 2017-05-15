
const fs = require('fs');
const child_process = require('child_process');
const http = require('http');
const https = require('https');


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

function action(url, cb) {
  if (url.startsWith("http://")) {
    //console.log(`using http [${url}]`);
    return http.get(url, cb);
  }
  if (url.startsWith("https://")) {
    //console.log(`using https [${url}]`);
    return https.get(url, cb);
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

function curl(src) {
  return (cb) => {
    let cmd = `curl ${src}`;
    //console.log(cmd);
    const file = fs.createWriteStream(`${dest}`);
    const request = action(src, (response) => {
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
      request.on("error", () => cb(false));
    }
  }
}

// try docker pull ${docker}
// try docker pull ${url}${docker}
// try curl ${url}/${docker}
// try curl ${url}/${docker}.docker
let actions = [ dockerPull(docker) ]
srcs.forEach((src) => {
  Array.prototype.push.apply(actions, [
    dockerPull(`${src}${docker}`),
    dockerPull(`${src}:${docker}`),
    dockerPull(`${src}/${docker}`),
    curl(`${src}${docker}`),
    curl(`${src}/${docker}`)
  ]);
  if (!docker.endsWith(".docker")) {
    Array.prototype.push.apply(actions, [
      curl(`${src}${docker}.docker`),
      curl(`${src}/${docker}.docker`)
    ]);
  }
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
