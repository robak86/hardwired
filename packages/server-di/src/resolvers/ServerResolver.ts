import {
  AbstractDependencyResolver,
  ContainerCache,
  ContainerEvents,
  DefinitionsSet,
  ModuleRegistry,
} from '@hardwired/di-core';
import { ClassSingletonResolver } from '@hardwired/di';
import { ContractRouteDefinition, HttpRequest, HttpResponse, IServer } from '@roro/s-middleware';
import { RouterResolver } from './RouterResolver';
import { IRouter } from '../../../s-middleware/src/App';

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
  private routers: { resolver: RouterResolver<any, IRouter>; registry: DefinitionsSet<any> }[] = [];
  private serverInstanceResolver: ClassSingletonResolver<TRegistry, TReturn>;

  constructor(private klass, private selectDependencies = container => [] as any[]) {
    super();
    this.serverInstanceResolver = new ClassSingletonResolver(klass, selectDependencies);
  }

  build = (registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx) => {
    const serverInstance = this.serverInstanceResolver.build(registry, cache, ctx);

    if (this.routers.length === 0) {
      throw new Error(
        '`Cannot instantiate server instance. Application module requires IRouter instance to be defined.`',
      );
    }

    if (this.routers.length > 1) {
      throw new Error(`Currently server di supports only single router instance`);
    }

    const routerInstance: IRouter = this.routers[0].resolver.build(this.routers[0].registry, cache, ctx);

    serverInstance.replaceListener(routerInstance.run);
    return serverInstance;
  };

  onRegister(events: ContainerEvents): any {
    events.onSpecificDefinitionAppend.add(RouterResolver, (resolver, registry) => {
      this.routers.push({ resolver, registry });
    });
  }
}
