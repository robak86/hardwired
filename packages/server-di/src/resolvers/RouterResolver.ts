import { AbstractDependencyResolver, ContainerCache, ModuleRegistry, RegistryRecord } from '@hardwired/di-core';
import { ClassSingletonResolver } from '@hardwired/di';
import { ContractRouteDefinition, HttpRequest, HttpResponse, IRouter } from '@roro/s-middleware';
import { HandlerResolver } from './HandlerResolver';

/**
 * This class is returned by the container and encapsulates all the wiring. It requires as an input http request object
 */
export type ContainerHandler<TReturn extends object> = {
  request(request: HttpRequest): HttpResponse<TReturn> | Promise<HttpResponse<TReturn>>;
  routeDefinition: ContractRouteDefinition<any, TReturn>;
};

export class RouterResolver<
  TRegistryRecord extends RegistryRecord,
  TReturn extends IRouter
> extends AbstractDependencyResolver<TRegistryRecord, TReturn> {
  private routerInstanceResolver: ClassSingletonResolver<TRegistryRecord, TReturn>;

  static isType(resolver: AbstractDependencyResolver<any, any>): resolver is RouterResolver<any, any> {
    return resolver instanceof RouterResolver;
  }

  constructor(private klass, private selectDependencies = container => [] as any[]) {
    super();
    this.routerInstanceResolver = new ClassSingletonResolver(klass, selectDependencies);
  }

  build = (registry: ModuleRegistry<TRegistryRecord>, cache: ContainerCache, ctx) => {
    const routerInstance = this.routerInstanceResolver.build(registry, cache, ctx);

    const handlersResolvers = registry.findResolvers(HandlerResolver.isType);

    const handlersInstances: ContainerHandler<any>[] = handlersResolvers.map(resolver => {
      return resolver.build(registry.findOwningModule(resolver), cache, ctx);
    });

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
}
