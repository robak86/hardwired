import {
  BaseModuleBuilder,
  ClassType,
  Definition,
  DefinitionsSet,
  MaterializedModuleEntries,
  ModuleRegistry,
  NotDuplicated,
} from '@hardwired/di-core';
import { ContractRouteDefinition, HttpRequest, HttpResponse, IServer, Middleware, Task } from '@roro/s-middleware';
import { TaskResolver } from '../resolvers/TaskResolver';
import { HandlerResolver } from '../resolvers/HandlerResolver';
import { MiddlewareResolver } from '../resolvers/MiddlewareResolver';
import { MiddlewarePipeResolver } from '../resolvers/MiddlewarePipeResolver';

import { ContainerHandler, ServerResolver } from '../resolvers/ServerResolver';
import { IRouter } from '../../../s-middleware/src/App';
import { RouterResolver } from '../resolvers/RouterResolver';

export type NextServerBuilder<TKey extends string, TReturn, TRegistry extends ModuleRegistry> = NotDuplicated<
  TKey,
  TRegistry,
  ServerModuleBuilder<
    {
      [K in keyof (TRegistry & { [K in TKey]: Definition<TReturn> })]: (TRegistry &
        { [K in TKey]: Definition<TReturn> })[K];
    }
  >
>;

export class ServerModuleBuilder<TRegistry extends ModuleRegistry> extends BaseModuleBuilder<TRegistry> {
  constructor(registry: DefinitionsSet<TRegistry>) {
    super(registry);
  }

  router<TKey extends string, TResult extends IRouter>(
    key: TKey,
    klass: ClassType<[], TResult>,
  ): NextServerBuilder<TKey, TResult, TRegistry>;
  router<TKey extends string, TDeps extends any[], TResult extends IRouter>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextServerBuilder<TKey, TResult, TRegistry>;
  router<TKey extends string, TDeps extends any[], TResult extends IRouter>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextServerBuilder<TKey, TResult, TRegistry> {
    const newRegistry = this.registry.extendDeclarations(key, new RouterResolver(klass, depSelect));
    return new ServerModuleBuilder(newRegistry) as any;
  }

  server<TKey extends string, TResult extends IServer>(
    key: TKey,
    klass: ClassType<[], TResult>,
  ): NextServerBuilder<TKey, TResult, TRegistry>;
  server<TKey extends string, TDeps extends any[], TResult extends IServer>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextServerBuilder<TKey, TResult, TRegistry>;
  server<TKey extends string, TDeps extends any[], TResult extends IServer>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextServerBuilder<TKey, TResult, TRegistry> {
    const newRegistry = this.registry.extendDeclarations(key, new ServerResolver(klass, depSelect));
    return new ServerModuleBuilder(newRegistry) as any;
  }

  task<TKey extends string, TResult>(
    key: TKey,
    klass: ClassType<[], Task<TResult>>,
  ): NextServerBuilder<TKey, TResult | Promise<TResult>, TRegistry>;
  task<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, Task<TResult>>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextServerBuilder<TKey, TResult | Promise<TResult>, TRegistry>;
  task<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, Task<TResult>>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextServerBuilder<TKey, TResult | Promise<TResult>, TRegistry> {
    const newRegistry = this.registry.extendDeclarations(key, new TaskResolver(klass, depSelect));
    return new ServerModuleBuilder(newRegistry) as any;
  }

  middleware<TKey extends string, TResult>(
    key: TKey,
    klass: ClassType<[], Middleware<TResult>>,
  ): NextServerBuilder<TKey, TResult | Promise<TResult>, TRegistry>;
  middleware<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, Middleware<TResult>>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextServerBuilder<TKey, TResult | Promise<TResult>, TRegistry>;
  middleware<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, Middleware<TResult>>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextServerBuilder<TKey, TResult | Promise<TResult>, TRegistry> {
    const newRegistry = this.registry.extendDeclarations(key, new MiddlewareResolver(klass, depSelect));
    return new ServerModuleBuilder(newRegistry) as any;
  }

  pipe<TKey extends string, TDeps extends Middleware<any>[]>(
    key: TKey,
    middlewareSelect: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextServerBuilder<TKey, Middleware<any>, TRegistry> {
    const newRegistry = this.registry.extendDeclarations(key, new MiddlewarePipeResolver(middlewareSelect));
    return new ServerModuleBuilder(newRegistry) as any;
  }

  handler<TKey extends string, TRequestParams extends object, TResult extends object>(
    key: TKey,
    routeDefinition: ContractRouteDefinition<TRequestParams, TResult>,
    klass: ClassType<[], Task<HttpResponse<TResult>>>,
  ): NextServerBuilder<TKey, ContainerHandler<TResult>, TRegistry>;
  handler<TKey extends string, TRequestParams extends object, TDeps extends any[], TResult extends object>(
    key: TKey,
    routeDefinition: ContractRouteDefinition<TRequestParams, TResult>,
    klass: ClassType<TDeps, Task<HttpResponse<TResult>>>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextServerBuilder<TKey, ContainerHandler<TResult>, TRegistry>;
  handler<TKey extends string, TRequestParams extends object, TDeps extends any[], TResult extends object>(
    key: TKey,
    routeDefinition: ContractRouteDefinition<TRequestParams, TResult>,
    klass: ClassType<TDeps, Task<HttpResponse<TResult>>>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextServerBuilder<TKey, ContainerHandler<TResult>, TRegistry> {
    const newRegistry = this.registry.extendDeclarations(key, new HandlerResolver(klass, depSelect, routeDefinition));
    return new ServerModuleBuilder(newRegistry) as any;
  }
}

export const serverDefinitions = <TRegistry extends ModuleRegistry>(
  ctx: DefinitionsSet<TRegistry>,
): ServerModuleBuilder<TRegistry & { request: Definition<HttpRequest> }> => {
  return new ServerModuleBuilder<TRegistry & { request: Definition<HttpRequest> }>(ctx as any);
};
