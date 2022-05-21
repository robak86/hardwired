import * as fs from 'fs';
import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packagesRoot = path.join(__dirname, '..', 'packages');

const packages = fs.readdirSync(packagesRoot).filter(item => fs.lstatSync(path.join(packagesRoot, item)).isDirectory());

packages.forEach(packageName => {
  const packageJSONPath = path.join(packagesRoot, packageName, 'package.json');

  const packageJSONData = JSON.parse(fs.readFileSync(packageJSONPath).toString());
  packageJSONData.author = 'Tomasz Robaczewski <robak86@gmail.com>';
  packageJSONData.repository = {
    type: 'git',
    url: 'git@github.com:robak86/hardwired.git',
  };

  packageJSONData.main = './dist/cjs/index.js';
  packageJSONData.types = './dist/cjs/index.d.ts';
  packageJSONData.exports = {
    default: './dist/esm/index.js',
    import: './dist/esm/index.js',
    types: './dist/esm/index.d.ts',
    require: './dist/cjs/index.js',
  };
  packageJSONData.files = ['dist', 'README.md'];
  fs.writeFileSync(packageJSONPath, JSON.stringify(packageJSONData, null, '  '));
});
