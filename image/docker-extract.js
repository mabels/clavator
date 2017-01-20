
const fs = require('fs');
const child_process = require('child_process');

const extdir = fs.mkdtempSync('./');
const docker = process.argv[process.argv.length-2]
const dest = process.argv[process.argv.length-1]

child_process.execSync(`docker pull ${docker}`);
child_process.execSync(`docker save -o ${extdir}/docker.tar ${docker}`);
child_process.execSync(`tar xfC ${extdir}/docker.tar ${extdir}`);
const manifest = JSON.parse(fs.readFileSync(`${extdir}/manifest.json`));
fs.mkdirSync(`${extdir}/root`)
manifest.forEach((m) => {
  m.Layers.forEach((l) => {
    child_process.execSync(`tar xfC ${extdir}/${l} ${dest}`);
  })
})
child_process.execSync(`rm -r ${extdir}`)
console.log(`extracted to ${dest}`)
