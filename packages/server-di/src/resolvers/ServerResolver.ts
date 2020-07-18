import {
  AbstractDependencyResolver,
  ContainerCache,
  ContainerEvents,
  ContainerService,
  DefinitionsSet,
  ModuleRegistry,
} from '@hardwired/di-core';
import { ClassSingletonResolver } from '@hardwired/di';
import { IServer } from '@roro/s-middleware';
import { Router } from '@roro/server';
import { HandlerResolver } from './HandlerResolver';
import { ContractRouteDefinition } from '../../../routing-contract/src/ContractRouteDefinition';
import { HttpRequest, HttpResponse } from '../../../s-middleware/src/response';

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
  private handlersResolvers: { resolver: HandlerResolver<any, any>; registry: DefinitionsSet<any> }[] = [];
  private router: Router = new Router();
  private serverInstanceResolver: ClassSingletonResolver<TRegistry, TReturn>;

  constructor(private klass, private selectDependencies = container => [] as any[]) {
    super();
    this.serverInstanceResolver = new ClassSingletonResolver(klass, selectDependencies);
  }

  build = (registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx) => {
    const serverInstance = this.serverInstanceResolver.build(registry, cache, ctx);

    const handlersInstances: ContainerHandler<any>[] = this.handlersResolvers.map(({ resolver, registry }) =>
      resolver.build(registry, cache, ctx),
    );
    this.router.replaceRoutes(
      handlersInstances.map(h => {
        return {
          routeDefinition: h.routeDefinition,
          handler: h.request,
        };
      }),
    );

    serverInstance.replaceListener(this.router.run);
    return serverInstance;
  };
  

  onRegister(events: ContainerEvents): any {
    events.onSpecificDefinitionAppend.add(HandlerResolver, (resolver, registry) => {
      this.handlersResolvers.push({ resolver, registry });
    });
  }
}
