import type { IContainer } from '../container/IContainer.js';

import { LifeTime } from './abstract/LifeTime.js';
import type { DefineScoped, DefineSingleton, DefineTransient } from './definitions.js';
import { Definition } from './abstract/Definition.js';

function chainMiddlewares<T, TLifeTime extends LifeTime>(
  middlewares: Middleware[],
  next: MiddlewareNextFn<T, any[]>,
  lifeTime: TLifeTime,
): Definition<T, TLifeTime, any> {
  return new Definition(Symbol(), lifeTime, (use: IContainer, ...args: any[]): T => {
    let nextHandler = next;

    for (let i = middlewares.length - 1; i >= 0; i--) {
      const currentMiddleware = middlewares[i];
      const currentNextHandler = nextHandler;

      nextHandler = (use: IContainer, ...args: any[]) => currentMiddleware(use, currentNextHandler, ...args);
    }

    return nextHandler(use, ...args);
  });
}

export type MiddlewareNextFn<TInstance, TArgs extends any[]> = (locator: IContainer, ...args: TArgs) => TInstance;

export type Middleware = <T, TArgs extends any[]>(
  locator: IContainer,
  next: MiddlewareNextFn<T, TArgs>,
  ...args: TArgs
) => T;

export const createMiddleware = (middlewareFn: Middleware): Middleware => {
  return middlewareFn;
};

export const withMiddleware = Object.assign(
  (...middleware: Middleware[]): DefineTransient => {
    return <TInstance, TArgs extends any[]>(
      create: (locator: IContainer<LifeTime.transient>, ...args: TArgs) => TInstance,
    ): Definition<TInstance, LifeTime.transient, TArgs> => {
      return chainMiddlewares(middleware, create, LifeTime.transient);
    };
  },
  {
    singleton(...middleware: Middleware[]): DefineSingleton {
      return <TInstance>(
        create: (locator: IContainer<LifeTime.singleton>) => TInstance,
      ): Definition<TInstance, LifeTime.singleton, []> => {
        return chainMiddlewares(middleware, create, LifeTime.singleton);
      };
    },
    scoped(...middleware: Middleware[]): DefineScoped {
      return <TInstance>(
        create: (locator: IContainer<LifeTime.scoped>) => TInstance,
      ): Definition<TInstance, LifeTime.scoped, []> => {
        return chainMiddlewares(middleware, create, LifeTime.scoped);
      };
    },
  },
);
