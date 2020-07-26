import {
  AbstractDependencyResolver,
  ContainerCache,
  ContainerService,
  ModuleRegistry,
  RegistryRecord,
} from '@hardwired/di-core';

import { SingletonResolver } from '@hardwired/di';

import { ContractRouteDefinition, HttpRequest } from '@roro/s-middleware';
import { ContainerHandler } from './ServerResolver';

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
          return instance.run();
        },
      };

      cache.setForGlobalScope(this.id, containerHandler);
      return containerHandler;
    }
  }
}
