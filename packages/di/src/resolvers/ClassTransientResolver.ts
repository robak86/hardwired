import { createResolverId } from '../utils/fastId';
import { ContainerCache } from '../container/container-cache';
import { DependencyResolver } from './DependencyResolver';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { ContainerService } from '../container/ContainerService';

export class ClassTransientResolver<TRegistry extends ModuleRegistry, TReturn = any>
  implements DependencyResolver<TRegistry, TReturn> {
  static type = 'transient';

  public id: string = createResolverId();
  public type = ClassTransientResolver.type;

  constructor(private klass, private selectDependencies = container => [] as any[]) {}

  build = (registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx) => {
    const constructorArgs = this.selectDependencies(ContainerService.proxyGetter(registry, cache, ctx)) as any;
    return new this.klass(...constructorArgs);
  };
}
