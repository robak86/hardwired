import { isInstanceDefinition, isModuleDefinition, Module } from '../module/Module';
import invariant from 'tiny-invariant';
import { unwrapThunk } from '../utils/Thunk';
import { ContainerContext } from './ContainerContext';
import { ContextLookup } from './ContextLookup';
import { ContextMutations } from './ContextMutations';

export const ContextService = {
  get<TLazyModule extends Module<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
    context: ContainerContext,
  ): Module.Materialized<TLazyModule>[K] {
    const resolver = ContextService.getInstanceResolver(moduleInstance, name, context);
    return ContextService.runInstanceDefinition(resolver, context);
  },

  getInstanceResolver(module: Module<any>, path: string, context: ContainerContext) {
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

  runInstanceDefinition(instanceDefinition: Module.InstanceDefinition, context: ContainerContext) {
    const module = ContextLookup.getModuleForResolverByResolverId(instanceDefinition.id, context);
    const materializedModule = ContextService.materializeModule(module, context);
    const resolver = unwrapThunk(instanceDefinition.resolverThunk);
    return resolver.build(instanceDefinition.id, context, materializedModule);
  },

  getModule(module: Module<any>, context: ContainerContext): Module<any> {
    const { moduleId } = module;

    if (!context.loadedModules[moduleId.id]) {
      context.loadedModules[moduleId.id] = module;
    }

    return context.loadedModules[moduleId.id];
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

  materializeModule<TModule extends Module<any>>(
    module: TModule,
    context: ContainerContext,
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
