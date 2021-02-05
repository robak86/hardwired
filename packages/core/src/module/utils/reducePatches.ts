import { ModulePatch } from '../../resolvers/abstract/ModulePatch';

export function reducePatches(
  modules: ModulePatch<any>[],
  previousPatches: Record<string, ModulePatch<any>> = {},
): Record<string, ModulePatch<any>> {
  const modulesById = { ...previousPatches };

  modules.forEach(module => {
    if (modulesById[module.moduleId.id]) {
      modulesById[module.moduleId.id] = modulesById[module.moduleId.id].merge(module);
    } else {
      modulesById[module.moduleId.id] = module;
    }
  });

  return modulesById;
}
