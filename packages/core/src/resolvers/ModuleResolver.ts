import { AbstractDependencyResolver, AbstractModuleResolver } from './AbstractDependencyResolver';
import { ModuleLookup } from '../module/ModuleLookup';
import { Module } from '../module/Module';
import { DependencyResolver } from './DependencyResolver';
import { DependencyFactory, DependencyResolverFactory, RegistryRecord } from '../module/RegistryRecord';
import { ContainerContext } from '../container/ContainerContext';
import { ImmutableSet } from '../collections/ImmutableSet';
import invariant from 'tiny-invariant';

class InstancesProxy {
  private buildFunctions: Record<string, (context: ContainerContext) => any> = {};
  private notifyFunctions: Record<string, () => any> = {};
  private addListenerFunctions: Record<string, (listener: () => void) => () => void> = {};

  getReference(key: string) {
    return new DependencyFactory(
      (cache: ContainerContext) => this.buildFunctions[key](cache),
      () => {
        invariant(this.notifyFunctions[key], 'notifyInvalidated called before modules initialization complete');
        this.notifyFunctions[key]();
      },
      listener => {
        invariant(
          this.addListenerFunctions[key],
          'registering onInvalidate listeners called before modules initialization complete',
        );

        return this.addListenerFunctions[key](listener);
      },
    );
  }

  replaceImplementation(key, resolver: AbstractDependencyResolver<any>) {
    this.buildFunctions[key] = resolver.build.bind(resolver);
    this.notifyFunctions[key] = resolver.notifyInvalidated;
    this.addListenerFunctions[key] = resolver.onInvalidate;
  }
}

export class ModuleResolver<TRegistryRecord extends RegistryRecord> extends AbstractModuleResolver<TRegistryRecord> {
  constructor(Module: Module<TRegistryRecord>) {
    super(Module);
  }

  // TODO: accept custom module resolverClass? in order to select ModuleResolver instance at container creation?
  build(containerContext: ContainerContext, injections = ImmutableSet.empty()): ModuleLookup<TRegistryRecord> {
    return containerContext.usingMaterializedModule(this.moduleId, () => {
      // TODO: merge injections with own this.registry injections
      // TODO: lazy loading ? this method returns an object. We can return proxy or object with getters and setters (lazy evaluated)
      const context: RegistryRecord = {};
      const dependencyResolvers: Record<string, AbstractDependencyResolver<any>> = {};
      const moduleResolvers: Record<string, AbstractModuleResolver<any>> = {};
      const moduleLookup: ModuleLookup<any> = new ModuleLookup(this.registry.moduleId);

      const instancesProxy = new InstancesProxy();

      const mergedInjections = this.registry.injections.merge(injections);

      this.registry.registry.forEach((resolverFactory: DependencyResolverFactory<any>, key: string) => {
        // TODO: by calling resolverFactory with proxy object, we could automatically track all dependencies for change detection
        //  ...but we probably don't wanna have this feature in the responsibility of this DI solution?? What about compatibility(proxy object) ?
        const resolver: DependencyResolver<any> = resolverFactory(context);

        if (resolver.type === 'dependency') {
          //TODO: consider adding check for making sure that this function is not called in define(..., ctx => ctx.someDependency(...))
          context[key] = instancesProxy.getReference(key);
          dependencyResolvers[key] = resolver;
          moduleLookup.appendDependencyFactory(key, resolver, context[key] as DependencyFactory<any>);
        }

        if (resolver.type === 'module') {
          if (mergedInjections.hasKey(resolver.moduleId.identity)) {
            const injectedModule = mergedInjections.get(resolver.moduleId.identity);
            moduleResolvers[key] = new ModuleResolver(injectedModule);
          } else {
            moduleResolvers[key] = resolver;
          }

          const registryLookup = moduleResolvers[key].build(containerContext, mergedInjections);

          context[key] = registryLookup.registry;
          moduleLookup.appendChild(registryLookup);
        }
      });

      Object.keys(dependencyResolvers).forEach(key => {
        instancesProxy.replaceImplementation(key, dependencyResolvers[key]);

        const onInit = dependencyResolvers?.[key]?.onInit;
        onInit && onInit.call(dependencyResolvers?.[key], moduleLookup);
      });

      return moduleLookup;
    });
  }
}

export const moduleImport = <TValue extends RegistryRecord>(value: Module<TValue>): ModuleResolver<TValue> => {
  return new ModuleResolver(value);
};
