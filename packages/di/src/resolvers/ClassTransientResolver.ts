import {
  ModuleRegistry,
  AbstractDependencyResolver,
  DefinitionsSet,
  ContainerCache,
  ContainerService,
} from '@hardwired/di-core';

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
