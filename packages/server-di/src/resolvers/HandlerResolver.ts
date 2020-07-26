import {
  AbstractDependencyResolver,
  ContainerCache,
  ContainerService,
  MaterializedModuleEntries,
  ModuleRegistry,
  RegistryRecord,
} from '@hardwired/di-core';

import { SingletonResolver } from '@hardwired/di';
import { ContractRouteDefinition, HttpRequest, Middleware } from '@roro/s-middleware';
import { ContainerHandler } from './ServerResolver';
import { composeMiddleware } from '../../../s-middleware/src/Middleware';

export class HandlerResolver<
  TRegistryRecord extends RegistryRecord,
  TReturn extends object
> extends AbstractDependencyResolver<TRegistryRecord, ContainerHandler<TReturn>> {
  static isType(resolver: AbstractDependencyResolver<any, any>): resolver is HandlerResolver<any, any> {
    return resolver instanceof HandlerResolver;
  }

  constructor(
    private klass,
    private selectDependencies = container => [] as any[],
    public selectMiddleware: (ctx: MaterializedModuleEntries<TRegistryRecord>) => Middleware[] = container => [],
    public routeDefinition: ContractRouteDefinition<any, TReturn>,
  ) {
    super();
  }

  build(registry: ModuleRegistry<TRegistryRecord>, cache: ContainerCache, ctx: any) {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      const containerHandler: ContainerHandler<any> = {
        routeDefinition: this.routeDefinition,
        request: async (request: HttpRequest) => {
          const requestCache = cache.forNewRequest();
          const requestRegistry = registry.extendDeclarations('request', new SingletonResolver(() => request));

          const constructorArgs = await Promise.all(
            this.selectDependencies(ContainerService.proxyGetter(requestRegistry, requestCache, ctx)) as any,
          );
          const instance = new this.klass(...constructorArgs);
          const middlewares = this.selectMiddleware(ContainerService.proxyGetter(requestRegistry, requestCache, ctx));

          console.log('WERQWER', middlewares);
          const composed = composeMiddleware(middlewares);
          console.log('composed', composed);
          const handlerResponse = instance.run();
          console.log('handlerResponse', handlerResponse);
          const middlewareResponse = composed.run(handlerResponse);
          // TODO: use correct types
          return middlewareResponse as any;
        },
      };

      cache.setForGlobalScope(this.id, containerHandler);
      return containerHandler;
    }
  }
}
