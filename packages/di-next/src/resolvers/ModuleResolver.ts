import { AbstractDependencyResolver, AbstractModuleResolver } from './AbstractDependencyResolver';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { ModuleBuilder } from '../builders/ModuleBuilder';
import { DependencyResolver } from './DependencyResolver';
import { DependencyFactory, DependencyResolverFactory, RegistryRecord } from "../module/RegistryRecord";
import { ContainerCache } from '../container/container-cache';
import { ImmutableSet } from '../collections/ImmutableSet';

// TODO: how to implement module.replace() ?!?!?
// prepending entries won't work, because we wont' have the correct materialized object
// appending entries may work, but we need to make sure that any reference is not bind during reducing entries
export class ModuleResolver<TReturn extends RegistryRecord> extends AbstractModuleResolver<TReturn> {
  constructor(moduleBuilder: ModuleBuilder<TReturn>) {
    super(moduleBuilder);
    console.log('Constructing module resolver with', moduleBuilder.moduleId)
  }

  // TODO: accept custom module resolverClass ? in order to select ModuleResolver instance at container creation?
  build(injections = ImmutableSet.empty()): [TReturn, ModuleRegistry] {
    // TODO: merge injections with own this.registry injections
    // TODO: lazy loading ? this method returns an object. We can return proxy or object with getters and setters (lazy evaluated)
    const context: RegistryRecord = {};
    const dependencyResolvers: Record<string, AbstractDependencyResolver<any>> = {};
    const moduleResolvers: Record<string, AbstractModuleResolver<any>> = {};
    const moduleRegistry: ModuleRegistry = new ModuleRegistry(this.registry.moduleId);
    const dependencyFactories: Record<string, DependencyFactory<any>> = {};
    const mergedInjections = this.registry.injections.merge(injections);

    this.registry.registry.forEach((resolverFactory: DependencyResolverFactory<any>, key: string) => {
      // TODO: by calling resolverFactory with proxy object, we could automatically track all dependencies for change detection
      //  ...but we probably don't wanna have this feature in the responsibility of this DI solution?? What about compatibility(proxy object) ?
      const resolver: DependencyResolver<any> = resolverFactory(context);

      if (resolver.type === 'dependency') {
        //TODO: consider adding check for making sure that this function is not called in define(..., ctx => ctx.someDependency(...))
        context[key] = (cache: ContainerCache) => dependencyFactories[key](cache);
        dependencyResolvers[key] = resolver;
        moduleRegistry.appendDependencyFactory(resolver.id, key, context[key] as DependencyFactory<any>);
      }

      if (resolver.type === 'module') {
        if (mergedInjections.hasKey(resolver.moduleId.identity)) {
          console.log('injecting', resolver.moduleId, 'instead of', resolver.moduleId)
          const injectedModuleBuilder = mergedInjections.get(resolver.moduleId.identity);
          moduleResolvers[key] = new ModuleResolver(injectedModuleBuilder);
        } else {
          moduleResolvers[key] = resolver;
        }

        const [registry, childModuleRegistry] = moduleResolvers[key].build(mergedInjections);

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
  }
}

export const moduleImport = <TValue extends RegistryRecord>(value: ModuleBuilder<TValue>): ModuleResolver<TValue> => {
  return new ModuleResolver(value);
};
