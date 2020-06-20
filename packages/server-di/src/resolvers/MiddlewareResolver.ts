import {
  ClassType,
  ContainerCache,
  ContainerService,
  createResolverId,
  DefinitionsSet,
  DependencyResolver,
  ModuleRegistry,
} from '@hardwired/di';
import { IMiddleware } from '../types/Middleware';

export class MiddlewareResolver<TRegistry extends ModuleRegistry, TReturn>
  implements DependencyResolver<TRegistry, Promise<TReturn>> {
  static readonly type = 'middleware';

  public id: string = createResolverId();
  public type = MiddlewareResolver.type;

  constructor(private klass: ClassType<any, IMiddleware<any>>, private selectDependencies = container => [] as any[]) {}

  async build(registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx: any) {
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
