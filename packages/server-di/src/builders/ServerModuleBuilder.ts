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
import { IMiddleware } from '../types/Middleware';
import { MiddlewareResolver } from '../resolvers/MiddlewareResolver';

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

  middleware<
    TKey extends string,
    TInput extends object,
    TOutput extends TInput,
    TResult extends IMiddleware<TInput, TOutput, any>
  >(
    key: TKey,

    klass: ClassType<[], TResult>,
    middlewareSelect: (ctx: MaterializedModuleEntries<TRegistry>) => IMiddleware<any, TInput, any>,
  ): NextServerBuilder<TKey, TResult, TRegistry>;
  middleware<
    TKey extends string,
    TDeps extends any[],
    TInput extends object,
    TOutput extends TInput,
    TResult extends IMiddleware<TInput, TOutput, any>
  >(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
    middlewareSelect: (ctx: MaterializedModuleEntries<TRegistry>) => IMiddleware<any, TInput, any>,
  ): NextServerBuilder<TKey, TResult, TRegistry>;
  middleware<
    TKey extends string,
    TDeps extends any[],
    TInput extends object,
    TOutput extends TInput,
    TResult extends IMiddleware<TInput, TOutput, any>
  >(
    key: TKey,
    klass: ClassType<TDeps, TResult>,
    depSelect?: (ctx: MaterializedModuleEntries<TRegistry>) => TDeps,
    middlewareSelect?: (ctx: MaterializedModuleEntries<TRegistry>) => IMiddleware<any, TInput, any>,
  ): NextServerBuilder<TKey, TResult, TRegistry> {
    const newRegistry = this.registry.extendDeclarations(key, new MiddlewareResolver(klass, depSelect));
    return new ServerModuleBuilder(newRegistry) as any;
  }
}

type MiddlewareSelectFunction<TRegistry extends ModuleRegistry, TInput extends object, TOutput extends TInput> = {
  <TTransitive1 extends object>(ctx: MaterializedModuleEntries<TRegistry>): [
    IMiddleware<any, TTransitive1, any>,
    IMiddleware<TTransitive1, TInput, any>,
  ];
  <TTransitive1 extends object>(ctx: MaterializedModuleEntries<TRegistry>): [IMiddleware<any, TInput, any>];

  // <TInput2 extends object, TLastOutput extends TInput2 & TOutput>(ctx: MaterializedModuleEntries<TRegistry>): [
  //   IMiddleware<any, TInput2, any>,
  //   IMiddleware<TInput2, TLastOutput, any>,
  // ];
};

export function compose<TInput1 extends object, TOutput extends object, TFinal extends object>(
  ...middlewares: [IMiddleware<TInput1, TOutput, TFinal>]
): IMiddleware<TInput1, TOutput, any>;
export function compose<
  TInput1 extends object,
  TInput2 extends object,
  TOutput,
  TFinal1 extends object,
  TFinal2 extends object
>(
  ...middlewares: [
    IMiddleware<TInput1, TInput2, TFinal1>,
    IMiddleware<TInput1 & TInput2, TInput1 & TInput2 & TOutput, TFinal1 | TFinal2>,
  ]
): IMiddleware<TInput1, TOutput, any>;
export function compose(...args: any): any {
  throw new Error('Implmenet me');
}

export const serverDefinitions = <TRegistry extends ModuleRegistry>(
  registry: DefinitionsSet<TRegistry>,
): ServerModuleBuilder<TRegistry> => new ServerModuleBuilder(registry);
