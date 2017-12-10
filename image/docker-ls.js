
const fs = require('fs');
const child_process = require('child_process');
const http = require('http');
const https = require('https');

const extdir = fs.mkdtempSync('./');
const docker = process.argv[process.argv.length-2]
const dest = process.argv[process.argv.length-1]

function action(url, cb) {
  if (url.startsWith("http://")) {
    console.log(`using http [${url}]`);
    return http.get(url, cb); 
  }
  if (url.startsWith("https://")) {
    console.log(`using https [${url}]`);
    return https.get(url, cb); 
  }
  if (url.startsWith("file://")) {
    console.log(`using file [${url}]`);
    cb(fs.createReadStream(url.substr("file://".length)));
  }
}

function switchDockerHttp(url, cb) {
  try {
    child_process.execSync(`docker pull ${url}`);
    const docker_split = url.split(/[\/:]+/)
    child_process.execSync(`docker save -o ${extdir}/docker.tar ${docker_split[docker_split.length-1]}`);
    console.log(`extracting ${url}[${docker_split[docker_split.length-1]}] to ${dest} `)
    cb(url, true)
  } catch (e) {
    const file = fs.createWriteStream(`${extdir}/docker.tar`);
    const request = action(url, (response) => {
      if (response.statusCode && response.statusCode != 200) {
        console.error(`HttpStatus:[${response.statusCode}]`);
        return cb(url, false)
      }
      response.on("error", () => cb(url, false));
      response.pipe(file);
      response.on("end", () => {
        console.log(`extracting ${url} to ${dest} `)
        cb(url, true);
      });
    });
  }
}

switchDockerHttp(docker, function switchAction(url, ok) {
  if (!ok) {
    if (!url.endsWith(".docker")) {
      switchDockerHttp(`${url}.docker`, switchAction);
    }
    return;
  }
  try {
    console.log(`creating temp output:[${extdir}]`);
    child_process.execSync(`mkdir -p ${extdir}`);
    child_process.execSync(`mkdir -p ${dest}`);
    child_process.execSync(`tar xfC ${extdir}/docker.tar ${extdir}`);
    const manifest = JSON.parse(fs.readFileSync(`${extdir}/manifest.json`));
    fs.mkdirSync(`${extdir}/root`)
    manifest.forEach((m) => {
      m.Layers.forEach((l) => {
        child_process.execSync(`tar xfC ${extdir}/${l} ${dest}`);
      })
    })
  } 
  finally {
    child_process.execSync(`rm -r ${extdir}`)
  }
})
