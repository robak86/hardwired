import type { IContainer } from '../../container/IContainer.js';
import { LifeTime } from '../abstract/LifeTime.js';
import type { DefineScoped, DefineSingleton, DefineTransient } from '../fn.js';
import { Definition } from '../impl/Definition.js';
import { TransientDefinition } from '../impl/TransientDefinition.js';

function chainMiddlewares<T, TLifeTime extends LifeTime, TArgs extends unknown[]>(
  middlewares: Middleware[],
  next: MiddlewareNextFn<T, TArgs>,
  lifeTime: TLifeTime,
): Definition<T, TLifeTime, TArgs> | TransientDefinition<T, TArgs> {
  const createFn = (use: IContainer, ...args: TArgs): T => {
    let nextHandler = next;

    for (let i = middlewares.length - 1; i >= 0; i--) {
      const currentMiddleware = middlewares[i];
      const currentNextHandler = nextHandler;

      nextHandler = (use: IContainer, ...args: TArgs) => currentMiddleware(use, currentNextHandler, ...args);
    }

    return nextHandler(use, ...args);
  };

  if (lifeTime === LifeTime.transient) {
    return new TransientDefinition<T, TArgs>(Symbol(), createFn);
  } else {
    return new Definition<T, TLifeTime, TArgs>(Symbol(), lifeTime, createFn);
  }
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

export type CustomFnFactory = {
  transient(...middleware: Middleware[]): DefineTransient;
  singleton(...middleware: Middleware[]): DefineSingleton;
  scoped(...middleware: Middleware[]): DefineScoped;
};

// TODO: this is very limited as we cannot produce fn function that accepts some additional configuration param, before factoryFn
export const withMiddleware: CustomFnFactory = {
  transient(...middleware: Middleware[]): DefineTransient {
    return <TInstance, TArgs extends unknown[]>(
      create: (locator: IContainer<LifeTime.transient>, ...args: TArgs) => TInstance,
    ): TransientDefinition<TInstance, TArgs> => {
      return chainMiddlewares(middleware, create, LifeTime.transient) as TransientDefinition<TInstance, TArgs>;
    };
  },
  singleton(...middleware: Middleware[]): DefineSingleton {
    return <TInstance>(
      create: (locator: IContainer<LifeTime.singleton>) => TInstance,
    ): Definition<TInstance, LifeTime.singleton, []> => {
      return chainMiddlewares(middleware, create, LifeTime.singleton) as Definition<TInstance, LifeTime.singleton, []>;
    };
  },
  scoped(...middleware: Middleware[]): DefineScoped {
    return <TInstance>(
      create: (locator: IContainer<LifeTime.scoped>) => TInstance,
    ): Definition<TInstance, LifeTime.scoped, []> => {
      return chainMiddlewares(middleware, create, LifeTime.scoped) as Definition<TInstance, LifeTime.scoped, []>;
    };
  },
};
