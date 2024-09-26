import { LifeTime } from './abstract/LifeTime.js';

import { fnDefinition, transientFn } from './abstract/FnDefinition.js';
import { IServiceLocator } from '../container/IContainer.js';
import { BaseDefinition } from './abstract/BaseDefinition.js';

export type DefineTransient = {
  <TInstance, TMeta, TArgs extends any[]>(
    create: (locator: IServiceLocator<LifeTime.transient>, ...args: TArgs) => TInstance,
    meta?: TMeta,
  ): BaseDefinition<TInstance, LifeTime.transient, TMeta, TArgs>;
};

export type DefineScoped = {
  <TInstance, TMeta>(
    create: (locator: IServiceLocator<LifeTime.scoped>) => TInstance,
    meta?: TMeta,
  ): BaseDefinition<TInstance, LifeTime.scoped, TMeta, []>;
};

export type DefineSingleton = {
  <TInstance, TMeta>(
    create: (locator: IServiceLocator<LifeTime.singleton>) => TInstance,
    meta?: TMeta,
  ): BaseDefinition<TInstance, LifeTime.singleton, TMeta, []>;
};

export type DefineFn = DefineTransient & {
  singleton: DefineSingleton;
  scoped: DefineScoped;
};

export const fn: DefineFn = Object.assign(transientFn, {
  singleton: fnDefinition(LifeTime.singleton),
  scoped: fnDefinition(LifeTime.scoped),
});
