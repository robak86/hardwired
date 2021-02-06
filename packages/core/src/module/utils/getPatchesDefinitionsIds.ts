import { ModulePatch } from '../../resolvers/abstract/ModulePatch';

export function getPatchesDefinitionsIds(patchesByModuleId: Record<string, ModulePatch<any>>): string[] {
  return Object.keys(patchesByModuleId).flatMap(moduleId => {
    return patchesByModuleId[moduleId].registry.keys.map(key => `${moduleId}:${key}`);
  });
}
