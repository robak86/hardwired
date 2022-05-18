import * as fs from 'fs';
import * as path from 'path';
import { dirname } from "path";
import { fileURLToPath } from "url";

const PACKAGE_TSCONFIG = 'tsconfig.json';
const PROJECT_TSCONFIG = 'tsconfig.json';

const __dirname = dirname(fileURLToPath(import.meta.url))
const packagesRoot = path.join(__dirname, '..', 'packages');
const packageDirectories = fs
  .readdirSync(packagesRoot)
  .filter(item => fs.lstatSync(path.join(packagesRoot, item)).isDirectory());

type DirectoryName = string;
type PackageName = string;

const packageJSONMap: Map<
  PackageName,
  {
    name: string;
    dependencies: { [packageName: string]: string };
    devDependencies: { [packageName: string]: string };
  }
> = new Map();

const packageDirnameMap: Map<PackageName, DirectoryName> = new Map();

packageDirectories.forEach(packageDirname => {
  const packageJSONPath = path.join(packagesRoot, packageDirname, 'package.json');
  const packageJSONData = JSON.parse(fs.readFileSync(packageJSONPath).toString());
  const packageName = packageJSONData.name;
  packageDirnameMap.set(packageName, packageDirname);
  packageJSONMap.set(packageName, packageJSONData);
});

const internalDependencyMap: Map<string, string[]> = new Map();
packageDirnameMap.forEach((_packageDirname, packageName) => {
  const { dependencies, devDependencies } = packageJSONMap.get(packageName)!;

  const internalDependencies = [
    ...(dependencies ? Object.keys(dependencies) : []),
    ...(devDependencies ? Object.keys(devDependencies) : []),
  ].filter(dep => packageDirnameMap.has(dep));

  internalDependencyMap.set(packageName, internalDependencies);
});

function resolveInternalDependencies(dependencies: string[]): string[] {
  const childDeps: string[] = [];

  for (let idep of dependencies) {
    const deps = internalDependencyMap.get(idep)!;
    const res = resolveInternalDependencies(deps);
    for (let jdep of res) {
      childDeps.push(jdep);
    }
  }
  const resolved = childDeps.concat(dependencies);
  // remove all duplicated after the first appearance
  return resolved.filter((item, idx) => resolved.indexOf(item) === idx);
}

packageDirnameMap.forEach((packageDirname, packageName) => {
  const tsconfigPath = path.join(packagesRoot, packageDirname, PACKAGE_TSCONFIG);
  const existingConfigData = fs.readFileSync(tsconfigPath);
  const existingConfig = JSON.parse(existingConfigData.toString());

  const internalDependencies = resolveInternalDependencies(internalDependencyMap.get(packageName)!);

  const tsconfigData = {
    extends: '../../tsconfig.json',
    compilerOptions: {
      ...existingConfig.compilerOptions,
      outDir: './lib',
      rootDir: './src',
      composite: true,
    },
    references: internalDependencies.map(dep => {
      return { path: `../${packageDirnameMap.get(dep)}/${PACKAGE_TSCONFIG}` };
    })
  };
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfigData, null, '  '));
});

const projectLevelTsconfigPath = path.join(packagesRoot, PROJECT_TSCONFIG);

const projectLevelTsconfigData = {
  files: [],
  include: [],
  references: resolveInternalDependencies(Array.from(packageDirnameMap.keys())).map(packageName => ({
    path: `./${packageDirnameMap.get(packageName)}/${PACKAGE_TSCONFIG}`,
  })),
};

fs.writeFileSync(projectLevelTsconfigPath, JSON.stringify(projectLevelTsconfigData, null, '  '));
