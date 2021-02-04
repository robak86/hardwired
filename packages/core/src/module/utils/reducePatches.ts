import { ImmutableMap } from '../../collections/ImmutableMap';
import { ModulePatch } from '../../resolvers/abstract/ModulePatch';

export function reducePatches(modules: ModulePatch<any>[]): ImmutableMap<any> {
  const modulesById = {};

  modules.forEach(module => {
    if (modulesById[module.moduleId.id]) {
      modulesById[module.moduleId.id] = modulesById[module.moduleId.id].merge(module);
    } else {
      modulesById[module.moduleId.id] = module;
    }
  });

  return ImmutableMap.fromObjectUnordered(modulesById);
}
