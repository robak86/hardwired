import {
  AbstractDependencyResolver,
  ClassType,
  ContainerCache,
  ContainerService,
  ModuleRegistry,
  RegistryRecord,
} from '@hardwired/di-core';
import { Middleware } from '@roro/s-middleware';

export class MiddlewareResolver<TRegistryRecord extends RegistryRecord, TReturn extends Middleware> extends AbstractDependencyResolver<
  TRegistryRecord,
  Promise<TReturn>
> {
  constructor(private klass: ClassType<any, Middleware>, private selectDependencies = container => [] as any[]) {
    super();
  }

  async build(registry: ModuleRegistry<TRegistryRecord>, cache: ContainerCache, ctx: any) {
    if (cache.hasInAsyncRequestScope(this.id)) {
      return cache.getFromAsyncRequestScope(this.id);
    } else {
      return cache.usingAsyncScope(this.id, async () => {
        const constructorArgs = await Promise.all(
          this.selectDependencies(ContainerService.proxyGetter(registry, cache, ctx)) as any,
        );

        const instance = new this.klass(...constructorArgs);
        return instance.run('TODO' as any, 'TODO' as any);
      });
    }
  }
}
