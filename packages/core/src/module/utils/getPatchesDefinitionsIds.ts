import { PatchedModule } from '../PatchedModule';

export function getPatchesDefinitionsIds(patchesByModuleId: Record<string, PatchedModule<any>>): string[] {
  return Object.keys(patchesByModuleId).flatMap(moduleId => {
    return patchesByModuleId[moduleId].registry.keys.map(key => `${moduleId}:${key}`);
  });
}
