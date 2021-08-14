import { isInstanceDefinition, isModuleDefinition, Module } from '../module/Module';
import { ContainerContext } from './ContainerContext';
import { ContextLookup } from './ContextLookup';
import { unwrapThunk } from '../utils/Thunk';
import { useProxy } from './ContextService';
import { ResolversRegistry } from './ResolversRegistry';

export class ModuleMaterialization {
  private materializedObjects: Record<string, any> = {};

  constructor(private resolversRegistry: ResolversRegistry) {}

  // TODO: use some interface instead of ContainerContext
  materialize<TModule extends Module<any>>(module: TModule, context: ContainerContext): Module.Materialized<TModule> {
    if (useProxy) {
      return this.materializeWithProxy(module, context);
    } else {
      return this.materializeWithAccessors(module, context);
    }
  }

  runInstanceDefinition(instanceDefinition: Module.InstanceDefinition, context: ContainerContext) {
    const module = ContextLookup.getModuleForResolverByResolverId(instanceDefinition.id, context);
    const materializedModule = this.materialize(module, context);
    const resolver = unwrapThunk(instanceDefinition.resolverThunk);
    return resolver.build(instanceDefinition.id, context, materializedModule);
  }

  private materializeWithAccessors<TModule extends Module<any>>(
    module: TModule,
    context: ContainerContext,
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
            return this.materialize(resolver, context);
          },
        });
      }
    });

    this.materializedObjects[module.moduleId.id] = materialized;

    return materialized;
  }

  private materializeWithProxy<TModule extends Module<any>>(
    m: TModule,
    context: ContainerContext,
  ): Module.Materialized<TModule> {
    // TODO: since all materialization is synchronous we can somehow reuse the instance of Proxy??
    const handler: ProxyHandler<ContainerContext> = {
      get: (target: ContainerContext, property: any, receiver: any) => {
        const definition = this.resolversRegistry.getModuleDefinition(m, property);

        if (isInstanceDefinition(definition)) {
          return this.runInstanceDefinition(definition, context);
        }

        if (isModuleDefinition(definition)) {
          const resolver = unwrapThunk(definition.resolverThunk);
          return this.materialize(resolver, context);
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
    this.materializedObjects[m.moduleId.id] = materialized;

    return materialized;
  }
}
