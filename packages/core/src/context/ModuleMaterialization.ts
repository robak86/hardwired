import { isInstanceDefinition, isImportDefinition, Module } from '../module/Module';
import { unwrapThunk } from '../utils/Thunk';
import { ResolversRegistry } from './ResolversRegistry';
import { InstancesCache } from './InstancesCache';

export const useProxy = typeof Proxy !== 'undefined';

export class ModuleMaterialization {
  private materializedObjects: Record<string, any> = {};

  constructor(private resolversRegistry: ResolversRegistry) {}

  materialize<TModule extends Module<any>>(
    module: TModule,
    instancesCache: InstancesCache,
  ): Module.Materialized<TModule> {
    if (useProxy) {
      return this.materializeWithProxy(module, instancesCache);
    } else {
      return this.materializeWithAccessors(module, instancesCache);
    }
  }

  runInstanceDefinition(
    module: Module<any>,
    instanceDefinition: Module.InstanceDefinition,
    instancesCache: InstancesCache,
  ) {
    // const module = this.resolversRegistry.getModuleForResolverByResolverId(instanceDefinition.id);
    const materializedModule = this.materialize(module, instancesCache);
    const resolver = unwrapThunk(instanceDefinition.resolverThunk);
    return resolver.build(instanceDefinition.id, instancesCache, this.resolversRegistry, materializedModule);
  }

  private materializeWithAccessors<TModule extends Module<any>>(
    module: TModule,
    instancesCache: InstancesCache,
  ): Module.Materialized<TModule> {
    // TODO: we should probably cache also by context!
    if (this.materializedObjects[module.moduleId.id]) {
      return this.materializedObjects[module.moduleId.id];
    }

    const materialized: any = {};

    module.registry.forEach((definition, key) => {
      if (isInstanceDefinition(definition)) {
        Object.defineProperty(materialized, key, {
          configurable: false,
          enumerable: true,
          get: () => {
            //TODO: move into closure so above this is called only once for all get calls
            const initializedResolver = this.resolversRegistry.getModuleInstanceResolver(module, key);
            return this.runInstanceDefinition(module, initializedResolver, instancesCache);
          },
        });
      }

      if (isImportDefinition(definition)) {
        Object.defineProperty(materialized, key, {
          configurable: false,
          enumerable: true,
          get: () => {
            const resolver = unwrapThunk(definition.resolverThunk);
            return this.materialize(resolver, instancesCache);
          },
        });
      }
    });

    this.materializedObjects[module.moduleId.id] = materialized;

    return materialized;
  }

  private materializeWithProxy<TModule extends Module<any>>(
    module: TModule,
    instancesCache: InstancesCache,
  ): Module.Materialized<TModule> {
    // TODO: since all materialization is synchronous we can somehow reuse the instance of Proxy??
    const handler: ProxyHandler<InstancesCache> = {
      get: (target: InstancesCache, property: any, receiver: any) => {
        const definition = this.resolversRegistry.getModuleDefinition(module, property);

        if (isInstanceDefinition(definition)) {
          return this.runInstanceDefinition(module, definition, instancesCache);
        }

        if (isImportDefinition(definition)) {
          const resolver = unwrapThunk(definition.resolverThunk);
          return this.materialize(resolver, instancesCache);
        }
      },

      set: (target: InstancesCache, p: string, value: any, receiver: any) => {
        throw new Error(`Materialized modules is readonly. Cannot update property ${p}`);
      },

      has(target: any, p: string | symbol): boolean {
        return module.registry.hasKey(p);
      },

      ownKeys: target => {
        return module.registry.keys;
      },

      getOwnPropertyDescriptor(k) {
        return {
          enumerable: true,
          configurable: true,
          writable: false,
        };
      },
    };

    const materialized = new Proxy(instancesCache, handler) as any;
    this.materializedObjects[module.moduleId.id] = materialized;

    return materialized;
  }
}
