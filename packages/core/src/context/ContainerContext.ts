import { Module } from '../module/Module';
import { ModulePatch } from '../module/ModulePatch';
import { SingletonScope } from '../container/SingletonScope';
import { reducePatches } from '../module/utils/reducePatches';
import { getPatchesDefinitionsIds } from '../module/utils/getPatchesDefinitionsIds';
import { ContainerScopeOptions } from '../container/Container';
import { ContextService } from './ContextService';

export type ContainerContext = {
  resolversById: Record<string, Module.InstanceDefinition>;
  resolversByModuleIdAndPath: Record<string, Module.InstanceDefinition>;
  modulesByResolverId: Record<string, Module<any>>;
  materializedObjects: Record<string, any>;
  globalScope: SingletonScope; // TODO: probably we shouldn't allow for such complex scopes rules (this feature may be harmful)
  hierarchicalScope: Record<string, any>;
  loadedModules: Record<string, Module<any>>;
  requestScope: Record<string, any>;
  frozenOverrides: Record<string, Module.InstanceDefinition>;
};

// TODO: do not deep copy - implement copy on write strategy
export const ContainerContext = {
  empty() {
    return ContainerContext.create([]);
  },

  create(overrides: ModulePatch<any>[]): ContainerContext {
    const reducedOverrides = reducePatches(overrides);
    const ownKeys = getPatchesDefinitionsIds(reducedOverrides);

    const context = {
      resolversById: {},
      requestScope: {},
      modulesByResolverId: {},
      materializedObjects: {},
      resolversByModuleIdAndPath: {},
      hierarchicalScope: {},
      frozenOverrides: {},
      globalScope: new SingletonScope(ownKeys),
      loadedModules: reducedOverrides,
    };

    ContextService.loadModules(Object.values(reducedOverrides), context);

    return context;
  },
};
