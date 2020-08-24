import { AbstractDependencyResolver, AbstractModuleResolver } from './AbstractDependencyResolver';
import { RegistryLookup } from '../module/RegistryLookup';
import { Module } from '../module/Module';
import { DependencyResolver } from './DependencyResolver';
import { DependencyFactory, DependencyResolverFactory, RegistryRecord } from '../module/RegistryRecord';
import { ContainerContext } from '../container/ContainerContext';
import { ImmutableSet } from '../collections/ImmutableSet';

export class ModuleResolver<TReturn extends RegistryRecord> extends AbstractModuleResolver<TReturn> {
  constructor(Module: Module<TReturn>) {
    super(Module);
  }

  // TODO: accept custom module resolverClass ? in order to select ModuleResolver instance at container creation?
  build(containerContext: ContainerContext, injections = ImmutableSet.empty()): [TReturn, RegistryLookup] {
    return containerContext.usingMaterializedModule(this.moduleId, () => {
      // TODO: merge injections with own this.registry injections
      // TODO: lazy loading ? this method returns an object. We can return proxy or object with getters and setters (lazy evaluated)
      const context: RegistryRecord = {};
      const dependencyResolvers: Record<string, AbstractDependencyResolver<any>> = {};
      const moduleResolvers: Record<string, AbstractModuleResolver<any>> = {};
      const moduleRegistry: RegistryLookup = new RegistryLookup(this.registry.moduleId);
      const dependencyFactories: Record<string, DependencyFactory<any>> = {};
      const mergedInjections = this.registry.injections.merge(injections);

      this.registry.registry.forEach((resolverFactory: DependencyResolverFactory<any>, key: string) => {
        // TODO: by calling resolverFactory with proxy object, we could automatically track all dependencies for change detection
        //  ...but we probably don't wanna have this feature in the responsibility of this DI solution?? What about compatibility(proxy object) ?
        const resolver: DependencyResolver<any> = resolverFactory(context);

        if (resolver.type === 'dependency') {
          //TODO: consider adding check for making sure that this function is not called in define(..., ctx => ctx.someDependency(...))
          context[key] = (cache: ContainerContext) => dependencyFactories[key](cache);
          dependencyResolvers[key] = resolver;
          moduleRegistry.appendDependencyFactory(key, resolver, context[key] as DependencyFactory<any>);
        }

        if (resolver.type === 'module') {
          if (mergedInjections.hasKey(resolver.moduleId.identity)) {
            const injectedModule = mergedInjections.get(resolver.moduleId.identity);
            moduleResolvers[key] = new ModuleResolver(injectedModule);
          } else {
            moduleResolvers[key] = resolver;
          }

          const [registry, childModuleRegistry] = moduleResolvers[key].build(containerContext, mergedInjections);

          context[key] = registry;
          moduleRegistry.appendChildModuleRegistry(childModuleRegistry);
        }
      });

      Object.keys(dependencyResolvers).forEach(key => {
        const onInit = dependencyResolvers?.[key]?.onInit;
        onInit && onInit.call(dependencyResolvers?.[key], moduleRegistry);
        // dependencyResolvers?.[key]?.onInit(moduleRegistry);
        dependencyFactories[key] = dependencyResolvers[key].build.bind(dependencyResolvers[key]);
      });

      return [context as TReturn, moduleRegistry];
    });
  }
}

export const moduleImport = <TValue extends RegistryRecord>(value: Module<TValue>): ModuleResolver<TValue> => {
  return new ModuleResolver(value);
};
