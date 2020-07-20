import {
  AbstractDependencyResolver,
  ContainerCache,
  ContainerEvents,
  DefinitionsSet,
  ModuleRegistry,
} from '@hardwired/di-core';
import { ClassSingletonResolver } from '@hardwired/di';
import { HttpRequest, HttpResponse, IServer, ContractRouteDefinition } from '@roro/s-middleware';
import { HandlerResolver } from './HandlerResolver';

/**
 * This class is returned by the container and encapsulates all the wiring. It requires as an input http request object
 */
export type ContainerHandler<TReturn extends object> = {
  request(request: HttpRequest): HttpResponse<TReturn> | Promise<HttpResponse<TReturn>>;
  routeDefinition: ContractRouteDefinition<any, TReturn>;
};

export class RouterResolver<
  TRegistry extends ModuleRegistry,
  TReturn extends IServer
> extends AbstractDependencyResolver<TRegistry, TReturn> {
  private handlersResolvers: { resolver: HandlerResolver<any, any>; registry: DefinitionsSet<any> }[] = [];

  private routerInstanceResolver: ClassSingletonResolver<TRegistry, TReturn>;

  constructor(private klass, private selectDependencies = container => [] as any[]) {
    super();
    this.routerInstanceResolver = new ClassSingletonResolver(klass, selectDependencies);
  }

  build = (registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx) => {
    const routerInstance = this.routerInstanceResolver.build(registry, cache, ctx);

    const handlersInstances: ContainerHandler<any>[] = this.handlersResolvers.map(({ resolver, registry }) =>
      resolver.build(registry, cache, ctx),
    );

    routerInstance.replaceRoutes(
      handlersInstances.map(h => {
        return {
          routeDefinition: h.routeDefinition,
          handler: h.request,
        };
      }),
    );

    return routerInstance;
  };

  onRegister(events: ContainerEvents): any {
    events.onSpecificDefinitionAppend.add(HandlerResolver, (resolver, registry) => {
      this.handlersResolvers.push({ resolver, registry });
    });
  }
}
