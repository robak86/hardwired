import {
  ContainerCache,
  ContainerService,
  createResolverId,
  DefinitionsSet,
  DependencyResolver,
  ModuleRegistry,
  SingletonResolver,
} from '@hardwired/di';
import { ContainerHandler, HttpRequest, RouteDefinition } from '../types/Middleware';

export class HandlerResolver<TRegistry extends ModuleRegistry, TReturn extends object>
  implements DependencyResolver<TRegistry, ContainerHandler<TReturn>> {
  static type = 'handler';

  public id: string = createResolverId();
  public type = HandlerResolver.type;

  constructor(
    private klass,
    private selectDependencies = container => [] as any[],
    private routeDefinition: RouteDefinition<any, TReturn>,
  ) {}

  build(registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx: any) {
    const middlewareOutput: ContainerHandler<any> = {
      pathDefinition: 'TODO', // TODO: why is it here ?
      request: async (request: HttpRequest) => {
        const requestCache = cache.forNewRequest();
        const requestRegistry = registry.extendDeclarations('request', new SingletonResolver(() => request));

        const constructorArgs = await Promise.all(
          this.selectDependencies(ContainerService.proxyGetter(requestRegistry, requestCache, ctx)) as any,
        );
        const instance = new this.klass(...constructorArgs);
        return instance.run();
      },
    };

    return middlewareOutput;
  }
}
