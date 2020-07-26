import {
  AbstractDependencyResolver,
  ClassType,
  ContainerCache,
  ContainerService,
  ModuleRegistry,
  RegistryRecord,
} from '@hardwired/di-core';
import { Middleware } from '@roro/s-middleware';

export class MiddlewareResolver<
  TRegistryRecord extends RegistryRecord,
  TReturn extends Middleware
> extends AbstractDependencyResolver<TRegistryRecord, TReturn> {
  constructor(private klass: ClassType<any, Middleware>, private selectDependencies = container => [] as any[]) {
    super();
  }

  // TODO: use request scope ? or just transient ?
  build(registry: ModuleRegistry<TRegistryRecord>, cache: ContainerCache, ctx: any) {
    const constructorArgs = this.selectDependencies(ContainerService.proxyGetter(registry, cache, ctx)) as any;

    return new this.klass(...constructorArgs);

    // if (cache.hasInAsyncRequestScope(this.id)) {
    //   return cache.getFromAsyncRequestScope(this.id);
    // } else {
    //
    //
    // }
  }
}
