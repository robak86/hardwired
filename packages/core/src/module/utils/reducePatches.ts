import { PatchedModule } from '../../resolvers/abstract/PatchedModule';
import { Module } from '../../resolvers/abstract/Module';

export function reducePatches(
  patchedModules: PatchedModule<any>[],
  previousPatches: Record<string, Module<any>> = {},
): Record<string, Module<any>> {
  const modulesById = { ...previousPatches };

  // TODO: optimize
  patchedModules.forEach(patchedModule => {
    if (modulesById[patchedModule.moduleId.id]) {
      modulesById[patchedModule.moduleId.id] = Module.fromPatchedModule(
        modulesById[patchedModule.moduleId.id].merge(patchedModule),
      );
    } else {
      modulesById[patchedModule.moduleId.id] = Module.fromPatchedModule(patchedModule);
    }
  });

  return modulesById;
}
