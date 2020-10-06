import {
  AbstractDependencyResolver,
  AbstractModuleResolver,
  DependencyResolverEvents,
} from './AbstractDependencyResolver';
import { ModuleLookup } from '../module/ModuleLookup';
import { Module } from '../module/Module';
import { DependencyResolver } from './DependencyResolver';
import { DependencyFactory, DependencyResolverFactory, RegistryRecord } from '../module/RegistryRecord';
import { ContainerContext } from '../container/ContainerContext';
import { ImmutableSet } from '../collections/ImmutableSet';
import invariant from 'tiny-invariant';

export class InstancesProxy {
  private buildFunctions: Record<string, (context: ContainerContext) => any> = {};
  private events: Record<string, DependencyResolverEvents> = {};

  getReference(key: string) {
    const self = this;

    return new DependencyFactory(
      (cache: ContainerContext) => {
        const build = self.buildFunctions[key];
        invariant(
          build,
          `Cannot find build implementation for ${key}. Available keys ${Object.keys(this.buildFunctions)}`,
        );
        return build(cache);
      },
      () => {
        const events = self.events[key];

        invariant(events, 'notifyInvalidated called before modules initialization complete');
        return events;
      },
    );
  }

  replaceImplementation(key, resolver: AbstractDependencyResolver<any>) {
    this.buildFunctions[key] = resolver.build.bind(resolver);
    this.events[key] = resolver.events;
  }
}

// This looks like responsibility of the ContainerContext
export const ModuleResolverService = {
  load(module: Module<any>, containerContext: ContainerContext, injections = ImmutableSet.empty()) {
    if (!containerContext.hasModule(module.moduleId)) {
      // TODO: merge injections with own this.registry injections
      // TODO: lazy loading ? this method returns an object. We can return proxy or object with getters and setters (lazy evaluated)
      const context: RegistryRecord = {};
      const moduleLookup: ModuleLookup<any> = new ModuleLookup(module.moduleId);
      const mergedInjections = module.injections.merge(injections);

      module.registry.forEach((resolverFactory: DependencyResolverFactory<any>, key: string) => {
        // TODO: by calling resolverFactory with proxy object, we could automatically track all dependencies for change detection
        //  ...but we probably don't wanna have this feature in the responsibility of this DI solution?? What about compatibility(proxy object) ?
        const resolver: DependencyResolver<any> = resolverFactory(context);

        if (resolver.type === 'dependency') {
          //TODO: consider adding check for making sure that this function is not called in define(..., ctx => ctx.someDependency(...))
          context[key] = moduleLookup.instancesProxy.getReference(key);
          moduleLookup.dependencyResolvers[key] = resolver;
          moduleLookup.appendDependencyFactory(key, resolver, context[key] as DependencyFactory<any>);
        }

        if (resolver.type === 'module') {
          if (mergedInjections.hasKey(resolver.moduleId.identity)) {
            const injectedModule = mergedInjections.get(resolver.moduleId.identity);
            moduleLookup.moduleResolvers[key] = new ModuleResolver(injectedModule);
          } else {
            moduleLookup.moduleResolvers[key] = resolver;
          }

          const childModuleResolver = moduleLookup.moduleResolvers[key];
          childModuleResolver.load(containerContext, mergedInjections);

          const childModuleLookup = containerContext.getModule(childModuleResolver.moduleId);

          context[key] = childModuleLookup.registry;
          moduleLookup.appendChild(childModuleLookup);
        }
      });

      containerContext.addModule(module.moduleId, moduleLookup);
    }
  },

  // TODO: should be somehow memoized ? don't wanna initialized already initialized module ?
  onInit(module: Module<any>, containerContext: ContainerContext) {
    const moduleLookup = containerContext.getModule(module.moduleId);

    moduleLookup.forEachModuleResolver(resolver => {
      resolver.onInit(containerContext);
    });

    moduleLookup.freezeImplementations();

    moduleLookup.forEachDependencyResolver(resolver => {
      const onInit = resolver.onInit;
      onInit && onInit.call(resolver, moduleLookup);
    });
  },
};

// TODO: since this class is completely stateless... should it even exists ?!
export class ModuleResolver<TRegistryRecord extends RegistryRecord> extends AbstractModuleResolver<TRegistryRecord> {
  constructor(Module: Module<TRegistryRecord>) {
    super(Module);
  }

  load(containerContext: ContainerContext, injections = ImmutableSet.empty()) {
    ModuleResolverService.load(this.module, containerContext, injections);
  }

  onInit(containerContext: ContainerContext) {
    ModuleResolverService.onInit(this.module, containerContext);
  }
}

// export const moduleImport = <TValue extends RegistryRecord>(value: Module<TValue>): ModuleResolver<TValue> => {
//   return new ModuleResolver(value);
// };
