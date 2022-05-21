import * as fs from 'fs';
import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const PACKAGE_TSCONFIG = 'tsconfig.json';
const PACKAGE_TSCONFIG_CJS = 'tsconfig.cjs.json';

const PROJECT_TSCONFIG = 'tsconfig.json';
const PROJECT_TSCONFIG_CJS = 'tsconfig.cjs.json';

const __dirname = dirname(fileURLToPath(import.meta.url));
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

function updateTsConfig(
  packageDirname: string,
  packageName: string,
  outDir: string,
  tsconfigFileName: string,
  baseTsConfigName: string,
) {
  const tsconfigPath = path.join(packagesRoot, packageDirname, tsconfigFileName);
  const existingConfigData = fs.readFileSync(tsconfigPath);
  const existingConfig = JSON.parse(existingConfigData.toString());

  const internalDependencies = resolveInternalDependencies(internalDependencyMap.get(packageName)!);

  const tsconfigData = {
    extends: `../../${baseTsConfigName}`,
    compilerOptions: {
      ...existingConfig.compilerOptions,
      outDir,
      rootDir: './src',
      composite: true,
    },
    references: internalDependencies.map(dep => {
      return { path: `../${packageDirnameMap.get(dep)}/${tsconfigFileName}` };
    }),
    exclude: ['./dist'],
    include: ['./src'],
  };
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfigData, null, '  '));
}

packageDirnameMap.forEach((packageDirname, packageName) => {
  updateTsConfig(packageDirname, packageName, './dist/esm', PACKAGE_TSCONFIG, PACKAGE_TSCONFIG);
  updateTsConfig(packageDirname, packageName, './dist/cjs', PROJECT_TSCONFIG_CJS, PROJECT_TSCONFIG_CJS);
});

function updateRootTsConfig(rootTsConfigFileName: string, targetTsConfigFileName: string) {
  const projectLevelTsconfigPath = path.join(packagesRoot, rootTsConfigFileName);

  const projectLevelTsconfigData = {
    files: [],
    include: [],
    references: resolveInternalDependencies(Array.from(packageDirnameMap.keys())).map(packageName => ({
      path: `./${packageDirnameMap.get(packageName)}/${targetTsConfigFileName}`,
    })),
  };

  fs.writeFileSync(projectLevelTsconfigPath, JSON.stringify(projectLevelTsconfigData, null, '  '));
}

updateRootTsConfig(PROJECT_TSCONFIG, PACKAGE_TSCONFIG);
updateRootTsConfig(PROJECT_TSCONFIG_CJS, PACKAGE_TSCONFIG_CJS);
