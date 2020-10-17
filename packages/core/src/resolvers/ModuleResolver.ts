import { ModuleLookup } from '../module/ModuleLookup';
import { Module } from '../module/Module';
import { DefinitionResolver, DefinitionResolverFactory } from './DependencyResolver';
import { DependencyFactory, RegistryRecord } from '../module/RegistryRecord';
import { ContainerContext } from '../container/ContainerContext';
import { ImmutableSet } from '../collections/ImmutableSet';

//TODO: This looks like responsibility of the ContainerContext ?
export const ModuleResolverService = {
  load(module: Module<any>, containerContext: ContainerContext, injections = ImmutableSet.empty()) {
    if (!containerContext.hasModule(module.moduleId)) {
      // TODO: merge injections with own this.registry injections
      // TODO: lazy loading ? this method returns an object. We can return proxy or object with getters and setters (lazy evaluated)
      const context: RegistryRecord = {};
      const moduleLookup: ModuleLookup<any> = new ModuleLookup(module.moduleId);
      const mergedInjections = module.injections.merge(injections);

      module.registry.forEach((resolverFactory: DefinitionResolverFactory, key: string) => {
        // TODO: by calling resolverFactory with proxy object, we could automatically track all dependencies for change detection
        //  ...but we probably don't wanna have this feature in the responsibility of this DI solution?? What about compatibility(proxy object) ?
        const resolver: DefinitionResolver = resolverFactory(context);

        if (resolver.type === 'dependency') {
          //TODO: consider adding check for making sure that this function is not called in define(..., ctx => ctx.someDependency(...))
          context[key] = moduleLookup.instancesProxy.getReference(key);
          moduleLookup.dependencyResolvers[key] = resolver;
          moduleLookup.appendDependencyFactory(key, resolver, context[key] as DependencyFactory<any>);
        }

        if (resolver.type === 'module') {
          if (mergedInjections.hasKey(resolver.moduleId.identity)) {
            const injectedModule = mergedInjections.get(resolver.moduleId.identity);
            moduleLookup.modules[key] = injectedModule;
          } else {
            moduleLookup.modules[key] = resolver;
          }

          const childModuleResolver = moduleLookup.modules[key];

          ModuleResolverService.load(childModuleResolver, containerContext, mergedInjections);

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

    moduleLookup.forEachModuleResolver(module => {
      ModuleResolverService.onInit(module, containerContext);
    });

    moduleLookup.freezeImplementations();

    moduleLookup.forEachDependencyResolver(resolver => {
      const onInit = resolver.onInit;
      onInit && onInit.call(resolver, moduleLookup);
    });
  },
};
