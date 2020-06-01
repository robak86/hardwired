import { createResolverId } from '../utils/fastId';
import { ContainerCache } from '../container/container-cache';
import { DependencyResolver } from './DependencyResolver';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { ContainerService } from '../container/ContainerService';

export class ClassSingletonResolver<TRegistry extends ModuleRegistry, TReturn = any>
  implements DependencyResolver<TRegistry, TReturn> {
  static type = 'singleton';

  public id: string = createResolverId();
  public type = ClassSingletonResolver.type;

  constructor(private klass, private selectDependencies = container => [] as any[]) {}

  build = (registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx) => {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      const constructorArgs = this.selectDependencies(ContainerService.proxyGetter(registry, cache, ctx)) as any;
      const instance = new this.klass(...constructorArgs);
      cache.setForGlobalScope(this.id, instance);
      return instance;
    }
  };
}
