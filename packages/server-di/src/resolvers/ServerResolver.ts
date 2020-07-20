import {
  AbstractDependencyResolver,
  ContainerCache,
  ContainerEvents,
  DefinitionsSet,
  ModuleRegistry,
} from '@hardwired/di-core';
import { ClassSingletonResolver } from '@hardwired/di';
import { IServer, ContractRouteDefinition, HttpRequest, HttpResponse } from '@roro/s-middleware';
import { RouterResolver } from './RouterResolver';
import invariant from 'tiny-invariant';
/**
 * This class is returned by the container and encapsulates all the wiring. It requires as an input http request object
 */
export type ContainerHandler<TReturn extends object> = {
  request(request: HttpRequest): HttpResponse<TReturn> | Promise<HttpResponse<TReturn>>;
  routeDefinition: ContractRouteDefinition<any, TReturn>;
};

export class ServerResolver<
  TRegistry extends ModuleRegistry,
  TReturn extends IServer
> extends AbstractDependencyResolver<TRegistry, TReturn> {
  private routers: { resolver: RouterResolver<any, any>; registry: DefinitionsSet<any> }[] = [];
  private serverInstanceResolver: ClassSingletonResolver<TRegistry, TReturn>;

  constructor(private klass, private selectDependencies = container => [] as any[]) {
    super();
    this.serverInstanceResolver = new ClassSingletonResolver(klass, selectDependencies);
  }

  build = (registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx) => {
    const serverInstance = this.serverInstanceResolver.build(registry, cache, ctx);

    invariant(this.routers.length === 1, `Currently server di supports only single router instance`);

    const routerInstance = this.routers[0].resolver.build(this.routers[0].registry, cache, ctx);

    serverInstance.replaceListener(routerInstance);
    return serverInstance;
  };

  onRegister(events: ContainerEvents): any {
    events.onSpecificDefinitionAppend.add(RouterResolver, (resolver, registry) => {
      this.routers.push({ resolver, registry });
    });
  }
}
