import { isInstanceDefinition, isModuleDefinition, Module } from '../module/Module';
import invariant from 'tiny-invariant';
import { unwrapThunk } from '../utils/Thunk';
import { ContainerContext } from './ContainerContext';
import { ContextLookup } from './ContextLookup';
import { ContextMutations } from './ContextMutations';
import { ModulePatch } from '../module/ModulePatch';

export const useProxy = typeof Proxy !== 'undefined';

export const ContextService = {
  get<TLazyModule extends Module<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
    context: ContainerContext,
  ): Module.Materialized<TLazyModule>[K] {
    const resolver = ContextService.getModuleInstanceResolver(moduleInstance, name, context);
    return ContextService.runInstanceDefinition(resolver, context);
  },

  getModuleDefinition(module: Module<any>, path: string, context: ContainerContext): Module.Definition {
    if (ContextLookup.hasInvariantResolver(module.moduleId, path, context)) {
      return ContextLookup.getInvariantResolverByModuleAndPath(module.moduleId, path, context);
    }

    if (ContextLookup.hasPatchedResolver(module.moduleId, path, context)) {
      return ContextLookup.getPatchedResolver(module.moduleId, path, context);
    }

    if (ContextLookup.hasResolverByModuleAndPath(module.moduleId, path, context)) {
      return ContextLookup.getResolverByModuleAndPath(module.moduleId, path, context);
    }

    const definition = module.registry.get(path);

    if (isInstanceDefinition(definition)) {
      if (!ContextLookup.hasResolver(definition, context)) {
        ContextMutations.addResolver(module, path, definition, context);
      }

      return definition;
    }

    if (isModuleDefinition(definition)) {
      return definition;
    }

    invariant(false, `Returned instance should be Module or Instance Resolver`);
  },

  getModuleInstanceResolver(module: Module<any>, path: string, context: ContainerContext): Module.InstanceDefinition {
    const resolver = ContextService.getModuleDefinition(module, path, context);
    invariant(isInstanceDefinition(resolver), `Given path ${path} should return instance resolver`);
    return resolver;
  },

  runInstanceDefinition(instanceDefinition: Module.InstanceDefinition, context: ContainerContext) {
    const module = ContextLookup.getModuleForResolverByResolverId(instanceDefinition.id, context);
    const materializedModule = ContextService.materialize(module, context);
    const resolver = unwrapThunk(instanceDefinition.resolverThunk);
    return resolver.build(instanceDefinition.id, context, materializedModule);
  },

  runWithPredicate(predicate: (resolver: Module.InstanceDefinition) => boolean, context: ContainerContext): unknown[] {
    const definitions = ContextLookup.filterLoadedDefinitions(predicate, context);
    return definitions.map(definition => {
      return this.runInstanceDefinition(definition, context);
    });
  },

  loadModules(modules: Module<any>[], context: ContainerContext) {
    function eagerLoad(module: Module<any>, context: ContainerContext) {
      module.registry.forEach((definition, key) => {
        if (isModuleDefinition(definition)) {
          const resolver = unwrapThunk(definition.resolverThunk);
          eagerLoad(resolver, context);
        }

        if (isInstanceDefinition(definition)) {
          try {
            ContextMutations.addResolver(module, key, definition, context);
          } catch (err) {
            throw new Error('Eagerly loaded modules array contains duplicated entries');
          }
        }
      });
    }

    modules.forEach(module => {
      eagerLoad(module, context);
    });
  },

  loadPatches(patches: ModulePatch<any>[], context: ContainerContext) {
    patches.reverse().forEach(modulePatch => {
      modulePatch.patchedResolvers.forEach(patchedResolver => {
        ContextMutations.addPatchedResolver(Module.fromPatchedModule(modulePatch), patchedResolver, context);
      });
    });
  },

  loadInvariants(patches: ModulePatch<any>[], context: ContainerContext) {
    patches.reverse().forEach(modulePatch => {
      modulePatch.patchedResolvers.forEach(patchedResolver => {
        ContextMutations.addGlobalOverrideResolver(Module.fromPatchedModule(modulePatch), patchedResolver, context);
      });
    });
  },

  materialize<TModule extends Module<any>>(module: TModule, context: ContainerContext): Module.Materialized<TModule> {
    if (useProxy) {
      return ContextService.materializeWithProxy(module, context);
    } else {
      return ContextService.materializeWithAccessors(module, context);
    }
  },

  materializeWithAccessors<TModule extends Module<any>>(
    module: TModule,
    context: ContainerContext,
  ): Module.Materialized<TModule> {
    // TODO: we should probably cache also by context!
    if (context.materializedObjects[module.moduleId.id]) {
      return context.materializedObjects[module.moduleId.id];
    }

    const materialized: any = {};

    module.registry.forEach((definition, key) => {
      if (isInstanceDefinition(definition)) {
        Object.defineProperty(materialized, key, {
          configurable: false,
          enumerable: true,
          get: () => {
            //TODO: move into closure so above this is called only once for all get calls
            const initializedResolver = this.getModuleInstanceResolver(module, key, context);
            return this.runInstanceDefinition(initializedResolver, context);
          },
        });
      }

      if (isModuleDefinition(definition)) {
        Object.defineProperty(materialized, key, {
          configurable: false,
          enumerable: true,
          get: () => {
            const resolver = unwrapThunk(definition.resolverThunk);
            return ContextService.materialize(resolver, context);
          },
        });
      }
    });

    context.materializedObjects[module.moduleId.id] = materialized;

    return materialized;
  },

  materializeWithProxy<TModule extends Module<any>>(
    m: TModule,
    context: ContainerContext,
  ): Module.Materialized<TModule> {
    // TODO: since all materialization is synchronous we can somehow reuse the instance of Proxy??
    const handler: ProxyHandler<ContainerContext> = {
      get: (target: ContainerContext, property: any, receiver: any) => {
        const definition = ContextService.getModuleDefinition(m, property, context);

        if (isInstanceDefinition(definition)) {
          return ContextService.runInstanceDefinition(definition, context);
        }

        if (isModuleDefinition(definition)) {
          const resolver = unwrapThunk(definition.resolverThunk);
          return ContextService.materialize(resolver, context);
        }
      },

      set: (target: ContainerContext, p: string, value: any, receiver: any) => {
        throw new Error(`Materialized modules is readonly. Cannot update property ${p}`);
      },

      has(target: any, p: string | symbol): boolean {
        return m.registry.hasKey(p);
      },

      ownKeys: target => {
        return m.registry.keys;
      },

      getOwnPropertyDescriptor(k) {
        return {
          enumerable: true,
          configurable: true,
          writable: false,
        };
      },
    };

    const materialized = new Proxy(context, handler) as any;
    context.materializedObjects[m.moduleId.id] = materialized;

    return materialized;
  },
};
