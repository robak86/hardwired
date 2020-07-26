import {
  ClassType,
  ContainerCache,
  ContainerService,
  createResolverId,
  ModuleRegistry,
  DependencyResolver,
  RegistryRecord,
} from '@hardwired/di-core';
import { Task } from '@roro/s-middleware';

export class TaskResolver<TRegistryRecord extends RegistryRecord, TReturn>
  implements DependencyResolver<TRegistryRecord, Promise<TReturn>> {
  static readonly type = 'middleware';

  public id: string = createResolverId();
  public type = TaskResolver.type;

  constructor(private klass: ClassType<any, Task<any>>, private selectDependencies = container => [] as any[]) {}

  async build(registry: ModuleRegistry<TRegistryRecord>, cache: ContainerCache, ctx: any) {
    if (cache.hasInAsyncRequestScope(this.id)) {
      return cache.getFromAsyncRequestScope(this.id);
    } else {
      return cache.usingAsyncScope(this.id, async () => {
        const constructorArgs = await Promise.all(
          this.selectDependencies(ContainerService.proxyGetter(registry, cache, ctx)) as any,
        );

        const instance = new this.klass(...constructorArgs);
        return instance.run();
      });
    }
  }
}
