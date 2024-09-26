import { IServiceLocator } from '../container/IContainer.js';
import { BaseDefinition } from './abstract/FnDefinition.js';
import { LifeTime } from './abstract/LifeTime.js';
import { DefineScoped, DefineSingleton, DefineTransient, fn } from './definitions.js';

export type DefineFnConstrained<TBase> = {
  <TInstance extends TBase, TMeta, TArgs extends any[]>(
    create: (locator: IServiceLocator<LifeTime.transient>, ...args: TArgs) => TInstance,
    meta?: TMeta,
  ): BaseDefinition<TInstance, LifeTime.transient, TMeta, TArgs>;

  singleton<TInstance extends TBase, TMeta>(
    create: (locator: IServiceLocator<LifeTime.singleton>) => TInstance,
    meta?: TMeta,
  ): BaseDefinition<TInstance, LifeTime.singleton, TMeta, []>;

  scoped<TInstance extends TBase, TMeta>(
    create: (locator: IServiceLocator<LifeTime.scoped>) => TInstance,
    meta?: TMeta,
  ): BaseDefinition<TInstance, LifeTime.scoped, TMeta, []>;
};

type UnknownDefinition = BaseDefinition<unknown, LifeTime, unknown, any[]>;

type Factory<T, TArgs extends any[]> = (locator: IServiceLocator, ...args: TArgs) => T;

type Middleware = <T, TArgs extends any[]>(
  locator: IServiceLocator,
  definition: BaseDefinition<T, LifeTime, unknown, TArgs>,
  next: Factory<T, TArgs>,
  ...args: TArgs
) => T;

const withTransaction = <T, TArgs extends any[]>(
  locator: IServiceLocator,
  definition: BaseDefinition<T, LifeTime, unknown, TArgs>,
  next: Factory<T, TArgs>,
  ...args: TArgs
): T => {
  return next(locator, ...args);
};

const traced = <T, TArgs extends any[]>(
  locator: IServiceLocator,
  definition: BaseDefinition<T, LifeTime, unknown, TArgs>,
  next: Factory<T, TArgs>,
  ...args: TArgs
): T => {
  // create new scoped locator with interceptors

  return next(locator, ...args);
};

const combine = Object.assign(
  (...middleware: Middleware[]): DefineTransient => {
    throw new Error('Implement me!');
  },
  {
    singleton(...middleware: Middleware[]): DefineSingleton {
      return <TInstance, TMeta>(
        create: (locator: IServiceLocator<LifeTime.singleton>) => TInstance,
        meta?: TMeta,
      ): BaseDefinition<TInstance, LifeTime.singleton, TMeta, []> => {
        throw new Error('Implement me!');
      };
    },
    scoped(...middleware: Middleware[]): DefineScoped {
      throw new Error('Implement me!');
    },
  },
);

const dbCommand = combine.scoped(withTransaction, traced);

const myDef = fn(() => 123);

const myQuery = dbCommand(use => {
  return use(myDef);
});

//
// // type Middleware<T, TArgs extends any[]> = (locator: IServiceLocator, next: Factory<T, []>, ...args: TArgs) => T;
//
// // type Factory<T, TArgs extends any[]> = (locator: IServiceLocator, ...args: TArgs) => T;
//
// // type Middleware<T, TArgs extends any[]> = (locator: IServiceLocator, next: () => UnknownDefinition) => IServiceLocator;
//
// //
//
// type CombineFn = {
//   // <TArgs extends any[], T>(factory: (locator: IServiceLocator, ...args: TArgs) => T): [T, TArgs];
//   //
//   // <TMiddleware extends Middleware<ReturnType<TFactory>, FactoryArgs<TFactory>>, TFactory extends Factory<any, any[]>>(
//   //   middleware1: TMiddleware,
//   //   factory: TFactory,
//   // ): [ReturnType<TFactory>, FactoryArgs<TFactory>];
//   //
//   // <
//   //   TArgs extends any[],
//   //   TMiddleware1 extends Middleware<ReturnType<TFactory>, TArgs>,
//   //   TMiddleware2 extends Middleware<ReturnType<TFactory>, TArgs>,
//   //   TFactory extends Factory<any, any[]>,
//   // >(
//   //   middleware1: TMiddleware1,
//   //   middleware2: TMiddleware2,
//   //   factory: TFactory,
//   // ): [ReturnType<TFactory>, FactoryArgs<TFactory>];
// };
