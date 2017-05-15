
const fs = require('fs');
const child_process = require('child_process');
const http = require('http');
const https = require('https');

const extdir = fs.mkdtempSync(process.env['TMPDIR'] === undefined ? './' : process.env['TMPDIR']);

const dockerFile = process.argv[process.argv.length-2]
const dest = process.argv[process.argv.length-1]

try {
  child_process.execSync(`mkdir -p ${extdir} ${dest}`);
  child_process.execSync(`tar xfC ${dockerFile} ${extdir}`);
  const manifest = JSON.parse(fs.readFileSync(`${extdir}/manifest.json`));
  //fs.mkdirSync(`${extdir}/root`)
  manifest.forEach((m) => {
    m.Layers.forEach((l) => {
      child_process.execSync(`tar xfC ${extdir}/${l} ${dest}`);
    })
  })
  console.log(`extracted [${dockerFile}] in [${dest}]`);
  process.exit(0);
} catch (e) {
  process.exit(27);
}
finally {
  child_process.execSync(`rm -r ${extdir}`)
}
