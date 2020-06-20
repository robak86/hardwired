import { ContainerCache } from '../container/container-cache';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { ContainerService } from '../container/ContainerService';
import { AbstractDependencyResolver } from './AbstractDependencyResolver';

export class ClassTransientResolver<TRegistry extends ModuleRegistry, TReturn = any> extends AbstractDependencyResolver<
  TRegistry,
  TReturn
> {
  constructor(private klass, private selectDependencies = container => [] as any[]) {
    super();
  }

  build = (registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx) => {
    const constructorArgs = this.selectDependencies(ContainerService.proxyGetter(registry, cache, ctx)) as any;
    return new this.klass(...constructorArgs);
  };
}
