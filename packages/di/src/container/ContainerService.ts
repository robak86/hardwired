import { ModuleRegistry } from '../module/ModuleRegistry';
import { DependencyResolver } from '../resolvers/DependencyResolver';
import { unwrapThunk } from '../utils/thunk';
import { containerProxyAccessor } from './container-proxy-accessor';
import { Container } from './Container';
import { DefinitionsSet } from "../module/DefinitionsSet";
import { ContainerCache } from "./container-cache";

export const ContainerService = {
  getChild<TRegistry extends ModuleRegistry>(registry:DefinitionsSet<TRegistry>, cache:ContainerCache, context, dependencyKey) {
    if (context && context[dependencyKey]) {
      return context[dependencyKey];
    }

    if (registry.declarations.hasKey(dependencyKey)) {
      let declarationResolver: DependencyResolver<any, any> = registry.declarations.get(dependencyKey);
      return declarationResolver.build(this, context, cache);
    }

    if (registry.imports.hasKey(dependencyKey)) {
      let childModule = unwrapThunk(registry.imports.get(dependencyKey));

      //TODO: investigate if we should cache containers
      // if (cache[childModule.moduleId.id]) {
      //     return containerProxyAccessor(cache[childModule.moduleId.id], cache);
      // } else {
      let childMaterializedModule: any = new Container(childModule, cache);
      // cache[childModule.moduleId.id] = childMaterializedModule;
      return containerProxyAccessor(childMaterializedModule, cache); //TODO: we have to pass cache !!!!
      // }
    }

    throw new Error(`Cannot find dependency for ${dependencyKey} key`);
  },
};
