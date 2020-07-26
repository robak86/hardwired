import { AbstractDependencyResolver, ContainerCache, ModuleRegistry, RegistryRecord, } from '@hardwired/di-core';

export class MiddlewarePipeResolver<TRegistryRecord extends RegistryRecord, TReturn> extends AbstractDependencyResolver<
  TRegistryRecord,
  Promise<TReturn>
> {
  constructor(private selectDependencies = container => [] as any[]) {
    super();
  }

  async build(registry: ModuleRegistry<TRegistryRecord>, cache: ContainerCache, ctx: any) {
    throw new Error('Implement me');
    // if (cache.hasInAsyncRequestScope(this.id)) {
    //   return cache.getFromAsyncRequestScope(this.id);
    // } else {
    //   return cache.usingAsyncScope(this.id, async () => {
    //     const constructorArgs = await Promise.all(
    //       this.selectDependencies(ContainerService.proxyGetter(registry, cache, ctx)) as any,
    //     );
    //
    //     const instance = new this.klass(...constructorArgs);
    //     return instance.run('TODO' as any);
    //   });
    // }
  }
}
