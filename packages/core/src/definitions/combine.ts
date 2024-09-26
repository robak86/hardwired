import { IServiceLocator } from '../container/IContainer.js';
import { LifeTime } from './abstract/LifeTime.js';
import { DefineScoped, DefineSingleton, DefineTransient } from './definitions.js';
import { v4 } from 'uuid';
import { BaseDefinition } from './abstract/BaseDefinition.js';

function chainMiddlewares<T, TLifeTime extends LifeTime>(
  middlewares: Middleware[],
  next: CreateFn<T, any[]>,
  lifeTime: TLifeTime,
): BaseDefinition<T, TLifeTime, any> {
  return new BaseDefinition(v4(), lifeTime, (use: IServiceLocator, ...args: any[]): T => {
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
    ): BaseDefinition<TInstance, LifeTime.transient, TArgs> => {
      return chainMiddlewares(middleware, create, LifeTime.transient);
    };
  },
  {
    singleton(...middleware: Middleware[]): DefineSingleton {
      return <TInstance>(
        create: (locator: IServiceLocator<LifeTime.singleton>) => TInstance,
      ): BaseDefinition<TInstance, LifeTime.singleton, []> => {
        return chainMiddlewares(middleware, create, LifeTime.singleton);
      };
    },
    scoped(...middleware: Middleware[]): DefineScoped {
      return <TInstance>(
        create: (locator: IServiceLocator<LifeTime.scoped>) => TInstance,
      ): BaseDefinition<TInstance, LifeTime.scoped, []> => {
        return chainMiddlewares(middleware, create, LifeTime.scoped);
      };
    },
  },
);
