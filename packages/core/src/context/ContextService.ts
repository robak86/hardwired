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
    const resolver = ContextService.getInstanceResolver(moduleInstance, name, context);
    return ContextService.runInstanceDefinition(resolver, context);
  },

  loadResolver(module: Module<any>, path: string, resolver, context: ContainerContext) {
    invariant(
      ContextLookup.hasResolverByModuleAndPath(module.moduleId, path, context),
      `Resolver path=${path} from module ${module.moduleId.id}is already loaded`,
    );

    ContextMutations.addResolver(module, path, resolver, context);
  },

  getInstanceResolver(module: Module<any>, path: string, context: ContainerContext) {
    if (ContextLookup.hasResolverByModuleAndPath(module.moduleId, path, context)) {
      return ContextLookup.getResolverByModuleAndPath(module.moduleId, path, context);
    }

    const [moduleOrInstance, instance] = path.split('.');
    const definition = module.registry.get(moduleOrInstance);

    if (isInstanceDefinition(definition)) {
      if (!ContextLookup.hasResolver(definition, context)) {
        ContextMutations.addResolver(module, path, definition, context);
      }

      return definition;
    }

    if (isModuleDefinition(definition)) {
      invariant(instance, `getInstanceResolver is not intended to return module. Path is missing instance target`);
      const resolver = unwrapThunk(definition.resolverThunk);
      const instanceResolver = ContextService.getInstanceResolver(resolver, instance, context);
      if (!ContextLookup.hasResolver(instanceResolver, context)) {
        ContextMutations.addResolver(module, path, instanceResolver, context);
      }
      return instanceResolver;
    }

    throw new Error('should not happen');
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
    modules.forEach(module => {
      this.eagerLoad(module, context);
    });
  },

  loadPatches(patches: ModulePatch<any>[], context: ContainerContext) {
    patches.reverse().forEach(modulePatch => {
      modulePatch.patchedResolvers.forEach(patchedResolver => {
        ContextMutations.addPatchedResolver(Module.fromPatchedModule(modulePatch), patchedResolver, context);
      });
    });
  },

  eagerLoad(module: Module<any>, context: ContainerContext) {
    module.registry.forEach((definition, key) => {
      if (isModuleDefinition(definition)) {
        const resolver = unwrapThunk(definition.resolverThunk);
        ContextService.eagerLoad(resolver, context);
      }

      if (isInstanceDefinition(definition)) {
        ContextService.getInstanceResolver(module, key, context);
      }
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
          get: () => {
            const initializedResolver = this.getInstanceResolver(module, key, context); //TODO: move into closure so above this is called only once for all get calls
            return this.runInstanceDefinition(initializedResolver, context);
          },
        });
      }

      if (isModuleDefinition(definition)) {
        Object.defineProperty(materialized, key, {
          configurable: false,
          get: () => {
            const resolver = unwrapThunk(definition.resolverThunk);
            return this.materialize(resolver, context);
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
        // if (property === Symbol.for('ORIGINAL')) return target;
        //
        // if (property === 'toJSON') {
        //   return () => ({ name: 'bar' })
        // }

        const definition = ContextLookup.hasResolverByModuleAndPath(m.moduleId, property, context)
          ? ContextLookup.getResolverByModuleAndPath(m.moduleId, property, context)
          : m.registry.get(property);

        if (!definition) {
          return undefined;
        }

        if (isInstanceDefinition(definition)) {
          if (!ContextLookup.hasResolver(definition, context)) {
            ContextMutations.addResolver(m, property, definition, context);
          }

          return ContextService.runInstanceDefinition(definition, context);
        }

        if (isModuleDefinition(definition)) {
          const resolver = unwrapThunk(definition.resolverThunk);
          return ContextService.materializeWithProxy(resolver, context);
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
