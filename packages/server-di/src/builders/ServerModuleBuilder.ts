import {
  BaseModuleBuilder,
  ClassType,
  Definition,
  MaterializedModuleEntries,
  ModuleRegistry,
  NotDuplicated,
  RegistryRecord,
} from '@hardwired/di-core';
import { ContractRouteDefinition, HttpRequest, HttpResponse, IServer, Middleware, Task } from '@roro/s-middleware';
import { TaskResolver } from '../resolvers/TaskResolver';
import { HandlerResolver } from '../resolvers/HandlerResolver';
import { MiddlewareResolver } from '../resolvers/MiddlewareResolver';
import { MiddlewarePipeResolver } from '../resolvers/MiddlewarePipeResolver';

import { ContainerHandler, ServerResolver } from '../resolvers/ServerResolver';
import { IRouter } from '../../../s-middleware/src/App';
import { RouterResolver } from '../resolvers/RouterResolver';

export type NextServerBuilder<TKey extends string, TReturn, TRegistryRecord extends RegistryRecord> = NotDuplicated<
  TKey,
  TRegistryRecord,
  ServerModuleBuilder<
    {
      [K in keyof (TRegistryRecord & { [K in TKey]: Definition<TReturn> })]: (TRegistryRecord &
        { [K in TKey]: Definition<TReturn> })[K];
    }
  >
>;

export class ServerModuleBuilder<TRegistryRecord extends RegistryRecord> extends BaseModuleBuilder<TRegistryRecord> {
  constructor(
    registry: ModuleRegistry<TRegistryRecord>,
    private selectMiddlewares: (ctx: MaterializedModuleEntries<TRegistryRecord>) => Middleware[] = () =>
      [] as Middleware[],
  ) {
    super(registry);
  }

  router<TKey extends string, TResult extends IRouter>(
    key: TKey,
    klass: ClassType<[], TResult>,
  ): NextServerBuilder<TKey, TResult, TRegistryRecord>;
  router<TKey extends string, TDeps extends any[], TResult extends IRouter>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistryRecord>) => TDeps,
  ): NextServerBuilder<TKey, TResult, TRegistryRecord>;
  router<TKey extends string, TDeps extends any[], TResult extends IRouter>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistryRecord>) => TDeps,
  ): NextServerBuilder<TKey, TResult, TRegistryRecord> {
    const newRegistry = this.registry.extendDeclarations(key, new RouterResolver(klass, depSelect));
    return new ServerModuleBuilder(newRegistry) as any;
  }

  server<TKey extends string, TResult extends IServer>(
    key: TKey,
    klass: ClassType<[], TResult>,
  ): NextServerBuilder<TKey, TResult, TRegistryRecord>;
  server<TKey extends string, TDeps extends any[], TResult extends IServer>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistryRecord>) => TDeps,
  ): NextServerBuilder<TKey, TResult, TRegistryRecord>;
  server<TKey extends string, TDeps extends any[], TResult extends IServer>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistryRecord>) => TDeps,
  ): NextServerBuilder<TKey, TResult, TRegistryRecord> {
    const newRegistry = this.registry.extendDeclarations(key, new ServerResolver(klass, depSelect));
    return new ServerModuleBuilder(newRegistry) as any;
  }

  task<TKey extends string, TResult>(
    key: TKey,
    klass: ClassType<[], Task<TResult>>,
  ): NextServerBuilder<TKey, TResult | Promise<TResult>, TRegistryRecord>;
  task<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, Task<TResult>>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistryRecord>) => TDeps,
  ): NextServerBuilder<TKey, TResult | Promise<TResult>, TRegistryRecord>;
  task<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, Task<TResult>>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistryRecord>) => TDeps,
  ): NextServerBuilder<TKey, TResult | Promise<TResult>, TRegistryRecord> {
    const newRegistry = this.registry.extendDeclarations(key, new TaskResolver(klass, depSelect));
    return new ServerModuleBuilder(newRegistry) as any;
  }

  middleware<TKey extends string, TResult extends Middleware>(
    key: TKey,
    klass: ClassType<[], TResult>,
  ): NextServerBuilder<TKey, TResult, TRegistryRecord>;
  middleware<TKey extends string, TDeps extends any[], TResult extends Middleware>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistryRecord>) => TDeps,
  ): NextServerBuilder<TKey, TResult, TRegistryRecord>;
  middleware<TKey extends string, TDeps extends any[], TResult extends Middleware>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistryRecord>) => TDeps,
  ): NextServerBuilder<TKey, TResult, TRegistryRecord> {
    const newRegistry = this.registry.extendDeclarations(key, new MiddlewareResolver(klass, depSelect));
    return new ServerModuleBuilder(newRegistry) as any;
  }

  pipe<TKey extends string, TDeps extends Middleware[]>(
    key: TKey,
    middlewareSelect: (ctx: MaterializedModuleEntries<TRegistryRecord>) => TDeps,
  ): NextServerBuilder<TKey, Middleware, TRegistryRecord> {
    const newRegistry = this.registry.extendDeclarations(key, new MiddlewarePipeResolver(middlewareSelect));
    return new ServerModuleBuilder(newRegistry) as any;
  }

  // TODO: should return ServerModuleBuilder with only "handler" method available
  withMiddleware<TNextRegistryRecord extends RegistryRecord, TMiddlewares extends Middleware[]>(
    middlewareSelect: (ctx: MaterializedModuleEntries<TRegistryRecord>) => TMiddlewares,
    define: (builder: ServerModuleBuilder<TRegistryRecord>) => ServerModuleBuilder<TNextRegistryRecord>,
  ): ServerModuleBuilder<TNextRegistryRecord> {
    return define(new ServerModuleBuilder(this.registry, middlewareSelect));
  }

  handler<TKey extends string, TRequestParams extends object, TResult extends object>(
    key: TKey,
    routeDefinition: ContractRouteDefinition<TRequestParams, TResult>,
    klass: ClassType<[], Task<HttpResponse<TResult>>>,
  ): NextServerBuilder<TKey, ContainerHandler<TResult>, TRegistryRecord>;
  handler<TKey extends string, TRequestParams extends object, TDeps extends any[], TResult extends object>(
    key: TKey,
    routeDefinition: ContractRouteDefinition<TRequestParams, TResult>,
    klass: ClassType<TDeps, Task<HttpResponse<TResult>>>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistryRecord>) => TDeps,
  ): NextServerBuilder<TKey, ContainerHandler<TResult>, TRegistryRecord>;
  handler<TKey extends string, TRequestParams extends object, TDeps extends any[], TResult extends object>(
    key: TKey,
    routeDefinition: ContractRouteDefinition<TRequestParams, TResult>,
    klass: ClassType<TDeps, Task<HttpResponse<TResult>>>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistryRecord>) => TDeps,
  ): NextServerBuilder<TKey, ContainerHandler<TResult>, TRegistryRecord> {
    const newRegistry = this.registry.extendDeclarations(
      key,
      new HandlerResolver(klass, depSelect, this.selectMiddlewares, routeDefinition),
    );
    return new ServerModuleBuilder(newRegistry) as any;
  }
}

export const serverDefinitions = <TRegistryRecord extends RegistryRecord>(
  ctx: ModuleRegistry<TRegistryRecord>,
): ServerModuleBuilder<TRegistryRecord & { request: Definition<HttpRequest> }> => {
  return new ServerModuleBuilder<TRegistryRecord & { request: Definition<HttpRequest> }>(ctx as any);
};
