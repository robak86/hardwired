import {
  BaseModuleBuilder,
  ClassType,
  Definition,
  DefinitionsSet,
  MaterializedModuleEntries,
  ModuleRegistry,
  NotDuplicated,
} from '@hardwired/di';
import {
  ContainerHandler,
  ContractRouteDefinition,
  HttpRequest,
  HttpResponse,
  IApplication,
  Task,
} from '@roro/s-middleware';
import { ApplicationResolver } from '../resolvers/ApplicationResolver';
import { TaskResolver } from '../resolvers/TaskResolver';
import { HandlerResolver } from '../resolvers/HandlerResolver';
import { Middleware } from '../../../s-middleware/src/Middleware';
import { MiddlewareResolver } from '../resolvers/MiddlewareResolver';
import { MiddlewarePipeResolver } from '../resolvers/MiddlewarePipeResolver';

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

  app<TKey extends string, TResult extends IApplication>(
    key: TKey,
    klass: ClassType<[], TResult>,
  ): NextServerBuilder<TKey, TResult, TRegistry>;
  app<TKey extends string, TDeps extends any[], TResult extends IApplication>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextServerBuilder<TKey, TResult, TRegistry>;
  app<TKey extends string, TDeps extends any[], TResult extends IApplication>(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextServerBuilder<TKey, TResult, TRegistry> {
    const newRegistry = this.registry.extendDeclarations(key, new ApplicationResolver(klass, depSelect));
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
  registry: DefinitionsSet<TRegistry>,
): ServerModuleBuilder<TRegistry & { request: Definition<HttpRequest> }> => new ServerModuleBuilder(registry) as any;
