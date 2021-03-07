import { Module } from '../resolvers/abstract/Module';
import { ModulePatch } from '../resolvers/abstract/ModulePatch';
import { SingletonScope } from './SingletonScope';
import { reducePatches } from '../module/utils/reducePatches';
import { getPatchesDefinitionsIds } from '../module/utils/getPatchesDefinitionsIds';
import { ResolversLookup } from './ResolversLookup';
import { ContainerScopeOptions } from './Container';

export type ContainerContextData = {
  resolversById: Record<string, Module.InstanceDefinition>;
  resolversByModuleIdAndPath: Record<string, Module.InstanceDefinition>;
  modulesByResolverId: Record<string, Module<any>>;
  materializedObjects: Record<string, any>;
  globalScope: SingletonScope; // TODO: probably we shouldn't allow for such complex scopes rules (this feature may be harmful)
  hierarchicalScope: Record<string, any>;
  modulesPatches: Record<string, ModulePatch<any>>; // TODO: it's redundant since ModulePatch is able to produce final module itself - eagerly populated loadedModules using only patches during context creation
  loadedModules: Record<string, Module<any>>;
  requestScope: Record<string, any>;
};

// TODO: do not deep copy - implement copy on write strategy
export const ContainerContextData = {
  checkoutRequestScope(overrides, prevContext: ContainerContextData): ContainerContextData {
    return {
      resolversById: prevContext.resolversById,
      modulesByResolverId: prevContext.modulesByResolverId,
      resolversByModuleIdAndPath: prevContext.resolversByModuleIdAndPath,
      globalScope: prevContext.globalScope,
      hierarchicalScope: prevContext.hierarchicalScope,
      modulesPatches: prevContext.modulesPatches,
      loadedModules: prevContext.loadedModules,
      requestScope: {},
      materializedObjects: {},
    };
  },

  childScope(options: ContainerScopeOptions, prevContext: ContainerContextData): ContainerContextData {
    throw new Error('myyk');
    // const { overrides = [], eager = [] } = options;
    // const childScopePatches = reducePatches(overrides, prevContext.modulesPatches);
    // const ownKeys = getPatchesDefinitionsIds(childScopePatches);
    //
    // // TODO: possible optimizations if patches array is empty ? beware to not mutate parent scope
    //
    // const childScopeContext = new ContainerContext(
    //   this.globalScope.checkoutChild(ownKeys),
    //   {},
    //   new ResolversLookup(),
    //   childScopePatches,
    //   {}
    // );
    //
    // eager.forEach(module => childScopeContext.eagerLoad(module));
    //
    // return childScopeContext;
  },

  create(overrides: ModulePatch<any>[]): ContainerContextData {
    const reducedOverrides = reducePatches(overrides);
    const ownKeys = getPatchesDefinitionsIds(reducedOverrides);

    return {
      resolversById: {},
      requestScope: {},
      modulesByResolverId: {},
      materializedObjects: {},
      resolversByModuleIdAndPath: {},
      globalScope: new SingletonScope(ownKeys),
      hierarchicalScope: {},
      modulesPatches: reducedOverrides,
      loadedModules: {},
    };
  },
};
