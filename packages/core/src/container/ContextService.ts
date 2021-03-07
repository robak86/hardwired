import { isInstanceDefinition, isModuleDefinition, Module } from '../resolvers/abstract/Module';
import invariant from 'tiny-invariant';
import { unwrapThunk } from '../utils/Thunk';
import { ContextRecord } from './ContainerContextStorage';
import { ContextLookup } from './ContextLookup';
import { ContextMutations } from './ContextMutations';
import { ContainerContext } from './ContainerContext';

export const ContextService = {
  getInstanceResolver(module: Module<any>, path: string, context: ContextRecord) {
    if (ContextLookup.hasResolverByModuleAndPath(module.moduleId, path, context)) {
      return ContextLookup.getResolverByModuleAndPath(module.moduleId, path, context);
    }

    const targetModule: Module<any> = ContextService.getModule(module, context);
    const [moduleOrInstance, instance] = path.split('.');
    const definition = targetModule.registry.get(moduleOrInstance);

    if (isInstanceDefinition(definition)) {
      if (!ContextLookup.hasResolver(definition, context)) {
        ContextMutations.addResolver(targetModule, path, definition, context);
      }

      return definition;
    }

    if (isModuleDefinition(definition)) {
      invariant(instance, `getInstanceResolver is not intended to return module. Path is missing instance target`);
      const resolver = unwrapThunk(definition.resolverThunk);
      const instanceResolver = ContextService.getInstanceResolver(resolver, instance, context);
      if (!ContextLookup.hasResolver(instanceResolver, context)) {
        ContextMutations.addResolver(targetModule, path, instanceResolver, context);
      }
      return instanceResolver;
    }

    throw new Error('should not happen');
  },

  runInstanceDefinition(instanceDefinition: Module.InstanceDefinition, context: ContextRecord) {
    const module = ContextLookup.getModuleForResolverByResolverId(instanceDefinition.id, context);
    const materializedModule = ContextService.materializeModule(module, context);
    const resolver = unwrapThunk(instanceDefinition.resolverThunk);
    return resolver.build(instanceDefinition.id, new ContainerContext(context), materializedModule);
  },

  getModule(module: Module<any>, context: ContextRecord): Module<any> {
    const { moduleId } = module;

    if (!context.loadedModules[moduleId.id]) {
      context.loadedModules[moduleId.id] = module;
    }

    return context.loadedModules[moduleId.id];
  },

  runWithPredicate(predicate: (resolver: Module.InstanceDefinition) => boolean, context: ContextRecord): unknown[] {
    const definitions = ContextLookup.filterLoadedDefinitions(predicate, context);
    return definitions.map(definition => {
      return this.runInstanceDefinition(definition, context);
    });
  },

  loadModules(modules: Module<any>[], context: ContextRecord) {
    modules.forEach(module => {
      this.eagerLoad(module, context);
    });
  },

  eagerLoad(module: Module<any>, context: ContextRecord) {
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

  materializeModule<TModule extends Module<any>>(
    module: TModule,
    context: ContextRecord,
  ): Module.Materialized<TModule> {
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
            return this.materializeModule(resolver, context);
          },
        });
      }
    });

    context.materializedObjects[module.moduleId.id] = materialized;

    return materialized;
  },
};
