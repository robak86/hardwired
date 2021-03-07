import { isInstanceDefinition, isModuleDefinition, Module } from '../resolvers/abstract/Module';
import invariant from 'tiny-invariant';
import { unwrapThunk } from '../utils/Thunk';
import { ContainerContextData } from './ContainerContextStorage';

export const ContextService = {
  getInstanceResolver(module: Module<any>, path: string, context: ContainerContextData) {
    // if (context.)

    // if (this.resolvers.hasByModule(module.moduleId, path)) {
    //   return this.resolvers.getByModule(module.moduleId, path);
    // }
    //
    // const targetModule: Module<any> = this.getModule(module);
    // const [moduleOrInstance, instance] = path.split(".");
    // const definition = targetModule.registry.get(moduleOrInstance);
    //
    // if (definition.type === "resolver") {
    //   if (!this.resolvers.has(definition)) {
    //     this.resolvers.add(targetModule, path, definition);
    //   }
    //
    //   return definition;
    // }
    //
    // if (definition.type === "module") {
    //   invariant(instance, `getInstanceResolver is not intended to return module. Path is missing instance target`);
    //   const resolver = unwrapThunk(definition.resolverThunk);
    //   const instanceResolver = this.getInstanceResolver(resolver, instance);
    //   if (!this.resolvers.has(instanceResolver)) {
    //     this.resolvers.add(targetModule, path, instanceResolver);
    //   }
    //   return instanceResolver;
    // }

    throw new Error('should not happen');
  },

  runInstanceDefinition(instanceDefinition: Module.InstanceDefinition, context: ContainerContextData) {
    throw new Error('should not happen');

    // const module = context.modulesByResolverId[instanceDefinition.id];
    // const materializedModule = this.materializeModule(module, context);
    // const resolver = unwrapThunk(instanceDefinition.resolverThunk);
    // return resolver.build(instanceDefinition.id, context, materializedModule);
  },

  materializeModule<TModule extends Module<any>>(
    module: TModule,
    context: ContainerContextData,
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
