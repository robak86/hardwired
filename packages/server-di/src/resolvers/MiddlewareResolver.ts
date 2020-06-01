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
    console.log('checking cache for', this.id);

    if (cache.hasInRequestScope(this.id)) {
      return cache.getFromRequestScope(this.id);
    } else {
      const constructorArgs = await Promise.all(
        this.selectDependencies(ContainerService.proxyGetter(registry, cache, ctx)) as any,
      );

      console.log('creating new instance for', this.id);
      const instance = new this.klass(...constructorArgs);
      const middlewareOutput = await instance.run();

      cache.setForRequestScope(this.id, middlewareOutput);

      return middlewareOutput;
    }
  }
}
