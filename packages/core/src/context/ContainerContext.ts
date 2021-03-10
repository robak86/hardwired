import { Module } from '../module/Module';
import { ModulePatch } from '../module/ModulePatch';
import { SingletonScope } from '../container/SingletonScope';
import { ContextService } from './ContextService';
import { getPatchedResolversIds } from './ContextScopes';

export type ContainerContext = {
  patchedResolversById: Record<string, Module.InstanceDefinition>;
  resolversById: Record<string, Module.InstanceDefinition>;
  invariantResolversById: Record<string, Module.InstanceDefinition>;
  modulesByResolverId: Record<string, Module<any>>;
  materializedObjects: Record<string, any>;
  frozenOverrides: Record<string, Module.InstanceDefinition>;

  globalScope: SingletonScope; // TODO: probably we shouldn't allow for such complex scopes rules (this feature may be harmful)
  hierarchicalScope: Record<string, any>;
  requestScope: Record<string, any>;
};

// TODO: do not deep copy - implement copy on write strategy
export const ContainerContext = {
  empty() {
    return ContainerContext.create([], [], []);
  },

  create(eager: ModulePatch<any>[], overrides: ModulePatch<any>[], invariants: ModulePatch<any>[]): ContainerContext {
    const ownKeys = getPatchedResolversIds(invariants);

    const context: ContainerContext = {
      resolversById: {},
      invariantResolversById: {},
      patchedResolversById: {},
      requestScope: {},
      modulesByResolverId: {},
      materializedObjects: {},
      hierarchicalScope: {},
      frozenOverrides: {},
      globalScope: new SingletonScope(ownKeys),
    };

    ContextService.loadModules(eager.map(Module.fromPatchedModule), context);
    ContextService.loadPatches(overrides, context);
    ContextService.loadInvariants(invariants, context);

    return context;
  },
};
