import * as fs from 'fs';
import * as path from 'path';

const packagesRoot = path.join(__dirname, '..', 'packages');

const packages = fs.readdirSync(packagesRoot).filter(item => fs.lstatSync(path.join(packagesRoot, item)).isDirectory());

packages.forEach(packageName => {
  const packageJSONPath = path.join(packagesRoot, packageName, 'package.json');

  const packageJSONData = JSON.parse(fs.readFileSync(packageJSONPath).toString());
  delete packageJSONData.scripts;
  packageJSONData.author = 'Tomasz Robaczewski <robak86@gmail.com>';
  packageJSONData.repository = {
    type: 'git',
    url: 'git@github.com:robak86/hardwired.git',
  };

  packageJSONData.main = './lib/index.js';
  packageJSONData.types = './lib/index.d.ts';
  packageJSONData.files = ['lib', 'README.md'];
  packageJSONData.scripts = {
    build: 'tsc -b ./tsconfig.json',
  };
  fs.writeFileSync(packageJSONPath, JSON.stringify(packageJSONData, null, '  '));
});
