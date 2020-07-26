import { AbstractDependencyResolver, ContainerCache, ModuleRegistry, RegistryRecord, } from '@hardwired/di-core';
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
  TRegistryRecord extends RegistryRecord,
  TReturn extends IServer
> extends AbstractDependencyResolver<TRegistryRecord, TReturn> {
  private serverInstanceResolver: ClassSingletonResolver<TRegistryRecord, TReturn>;

  constructor(private klass, private selectDependencies = container => [] as any[]) {
    super();
    this.serverInstanceResolver = new ClassSingletonResolver(klass, selectDependencies);
  }

  build = (registry: ModuleRegistry<TRegistryRecord>, cache: ContainerCache, ctx) => {
    const serverInstance = this.serverInstanceResolver.build(registry, cache, ctx);
    const routers = registry.findResolvers(RouterResolver.isType);

    if (routers.length === 0) {
      throw new Error(
        '`Cannot instantiate server instance. Application module requires IRouter instance to be defined.`',
      );
    }

    if (routers.length > 1) {
      throw new Error(`Currently server di supports only single router instance`);
    }

    const routerInstance: IRouter = routers[0].build(registry.findOwningModule(routers[0]), cache, ctx);

    serverInstance.replaceListener(routerInstance.run);
    return serverInstance;
  };
}
