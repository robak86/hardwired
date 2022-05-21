import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packagesRoot = path.join(__dirname, '..', 'packages');
const packages = fs.readdirSync(packagesRoot).filter(item => fs.lstatSync(path.join(packagesRoot, item)).isDirectory());

packages.forEach(packageName => {
    const packageJSONPath = path.join(packagesRoot, packageName, 'package.json');
    const packageJSONData = JSON.parse(fs.readFileSync(packageJSONPath).toString());
    delete packageJSONData.type // Remove type, because having this property set doesn't allow package to by hybrid
    fs.writeFileSync(packageJSONPath, JSON.stringify(packageJSONData, null, '  '));
});
