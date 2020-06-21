import {
  AbstractDependencyResolver,
  ClassType,
  ContainerCache,
  ContainerService,
  DefinitionsSet,
  ModuleRegistry,
} from '@hardwired/di';
import { Middleware } from '@roro/s-middleware';

export class MiddlewareResolver<TRegistry extends ModuleRegistry, TReturn> extends AbstractDependencyResolver<
  TRegistry,
  Promise<TReturn>
> {
  constructor(private klass: ClassType<any, Middleware<any>>, private selectDependencies = container => [] as any[]) {
    super();
  }

  async build(registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx: any) {
    if (cache.hasInAsyncRequestScope(this.id)) {
      return cache.getFromAsyncRequestScope(this.id);
    } else {
      return cache.usingAsyncScope(this.id, async () => {
        const constructorArgs = await Promise.all(
          this.selectDependencies(ContainerService.proxyGetter(registry, cache, ctx)) as any,
        );

        const instance = new this.klass(...constructorArgs);
        return instance.run('TODO' as any);
      });
    }
  }
}
