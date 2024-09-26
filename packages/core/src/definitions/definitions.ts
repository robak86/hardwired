import { LifeTime } from './abstract/LifeTime.js';

import { fnDefinition, transientFn } from './abstract/FnDefinition.js';
import { IServiceLocator } from '../container/IContainer.js';
import { BaseDefinition } from './abstract/BaseDefinition.js';

export type DefineTransient = {
  <TInstance, TArgs extends any[]>(
    create: (locator: IServiceLocator<LifeTime.transient>, ...args: TArgs) => TInstance,
  ): BaseDefinition<TInstance, LifeTime.transient, TArgs>;
};

export type DefineScoped = {
  <TInstance>(
    create: (locator: IServiceLocator<LifeTime.scoped>) => TInstance,
  ): BaseDefinition<TInstance, LifeTime.scoped, []>;
};

export type DefineSingleton = {
  <TInstance>(
    create: (locator: IServiceLocator<LifeTime.singleton>) => TInstance,
  ): BaseDefinition<TInstance, LifeTime.singleton, []>;
};

export type DefineFn = DefineTransient & {
  singleton: DefineSingleton;
  scoped: DefineScoped;
};

export const fn: DefineFn = Object.assign(transientFn, {
  singleton: fnDefinition(LifeTime.singleton),
  scoped: fnDefinition(LifeTime.scoped),
});
