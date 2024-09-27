import { IServiceLocator } from '../container/IContainer.js';
import { LifeTime } from './abstract/LifeTime.js';
import { DefineScoped, DefineSingleton, DefineTransient } from './definitions.js';
import { Definition } from './abstract/Definition.js';

function chainMiddlewares<T, TLifeTime extends LifeTime>(
  middlewares: Middleware[],
  next: CreateFn<T, any[]>,
  lifeTime: TLifeTime,
): Definition<T, TLifeTime, any> {
  return new Definition(Symbol(), lifeTime, (use: IServiceLocator, ...args: any[]): T => {
    let nextHandler = next;
    for (let i = middlewares.length - 1; i >= 0; i--) {
      const currentMiddleware = middlewares[i];
      const currentNextHandler = nextHandler;
      nextHandler = (use: IServiceLocator, ...args: any[]) => currentMiddleware(use, currentNextHandler, ...args);
    }

    return nextHandler(use, ...args);
  });
}

export type CreateFn<TInstance, TArgs extends any[]> = (locator: IServiceLocator, ...args: TArgs) => TInstance;

export type Middleware = <T, TArgs extends any[]>(
  locator: IServiceLocator,
  next: CreateFn<T, TArgs>,
  ...args: TArgs
) => T;

export const combine = Object.assign(
  (...middleware: Middleware[]): DefineTransient => {
    return <TInstance, TArgs extends any[]>(
      create: (locator: IServiceLocator<LifeTime.transient>, ...args: TArgs) => TInstance,
    ): Definition<TInstance, LifeTime.transient, TArgs> => {
      return chainMiddlewares(middleware, create, LifeTime.transient);
    };
  },
  {
    singleton(...middleware: Middleware[]): DefineSingleton {
      return <TInstance>(
        create: (locator: IServiceLocator<LifeTime.singleton>) => TInstance,
      ): Definition<TInstance, LifeTime.singleton, []> => {
        return chainMiddlewares(middleware, create, LifeTime.singleton);
      };
    },
    scoped(...middleware: Middleware[]): DefineScoped {
      return <TInstance>(
        create: (locator: IServiceLocator<LifeTime.scoped>) => TInstance,
      ): Definition<TInstance, LifeTime.scoped, []> => {
        return chainMiddlewares(middleware, create, LifeTime.scoped);
      };
    },
  },
);
