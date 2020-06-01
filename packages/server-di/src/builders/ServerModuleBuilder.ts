import {
  BaseModuleBuilder,
  ClassType,
  Definition,
  DefinitionsSet,
  MaterializedModuleEntries,
  ModuleRegistry,
  NotDuplicated,
} from '@hardwired/di';
import { IApplication } from '../types/App';
import { ApplicationResolver } from '../resolvers/ApplicationResolver';
import { ContainerHandler, HttpRequest, IMiddleware } from '../types/Middleware';
import { MiddlewareResolver } from '../resolvers/MiddlewareResolver';
import { HandlerResolver } from '../resolvers/HandlerResolver';

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

  middleware<TKey extends string, TResult>(
    key: TKey,
    klass: ClassType<[], IMiddleware<TResult>>,
  ): NextServerBuilder<TKey, TResult | Promise<TResult>, TRegistry>;
  middleware<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, IMiddleware<TResult>>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextServerBuilder<TKey, TResult | Promise<TResult>, TRegistry>;
  middleware<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    klass: ClassType<TDeps, IMiddleware<TResult>>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextServerBuilder<TKey, TResult | Promise<TResult>, TRegistry> {
    const newRegistry = this.registry.extendDeclarations(key, new MiddlewareResolver(klass, depSelect));
    return new ServerModuleBuilder(newRegistry) as any;
  }

  handler<TKey extends string, TResult>(
    key: TKey,
    routeDefinition: any,
    klass: ClassType<[], IMiddleware<TResult>>,
  ): NextServerBuilder<TKey, ContainerHandler<TResult>, TRegistry>;
  handler<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    routeDefinition: any,
    klass: ClassType<TDeps, IMiddleware<TResult>>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextServerBuilder<TKey, ContainerHandler<TResult>, TRegistry>;
  handler<TKey extends string, TDeps extends any[], TResult>(
    key: TKey,
    routeDefinition: any,
    klass: ClassType<TDeps, IMiddleware<TResult>>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
  ): NextServerBuilder<TKey, ContainerHandler<TResult>, TRegistry> {
    const newRegistry = this.registry.extendDeclarations(key, new HandlerResolver(klass, depSelect));
    return new ServerModuleBuilder(newRegistry) as any;
  }
}

export const serverDefinitions = <TRegistry extends ModuleRegistry>(
  registry: DefinitionsSet<TRegistry>,
): ServerModuleBuilder<TRegistry & { request: Definition<HttpRequest> }> => new ServerModuleBuilder(registry) as any;
