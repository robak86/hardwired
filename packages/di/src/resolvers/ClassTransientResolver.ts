import {
  RegistryRecord,
  AbstractDependencyResolver,
  ModuleRegistry,
  ContainerCache,
  ContainerService,
} from '@hardwired/di-core';

export class ClassTransientResolver<TRegistryRecord extends RegistryRecord, TReturn = any> extends AbstractDependencyResolver<
  TRegistryRecord,
  TReturn
> {
  constructor(private klass, private selectDependencies = container => [] as any[]) {
    super();
  }

  build = (registry: ModuleRegistry<TRegistryRecord>, cache: ContainerCache, ctx) => {
    const constructorArgs = this.selectDependencies(ContainerService.proxyGetter(registry, cache, ctx)) as any;
    return new this.klass(...constructorArgs);
  };
}
