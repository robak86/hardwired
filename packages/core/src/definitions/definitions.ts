import { LifeTime } from './abstract/LifeTime.js';

import { fnDefinition, transientFn } from './abstract/FnDefinition.js';
import { IContainer } from '../container/IContainer.js';
import { Definition } from './abstract/Definition.js';

export type DefineTransient = {
  <TInstance, TArgs extends any[]>(
    create: (locator: IContainer<LifeTime.transient>, ...args: TArgs) => TInstance,
  ): Definition<TInstance, LifeTime.transient, TArgs>;
};

export type DefineScoped = {
  <TInstance>(create: (locator: IContainer<LifeTime.scoped>) => TInstance): Definition<TInstance, LifeTime.scoped, []>;
};

export type DefineSingleton = {
  <TInstance>(
    create: (locator: IContainer<LifeTime.singleton>) => TInstance,
  ): Definition<TInstance, LifeTime.singleton, []>;
};

export type DefineFn = DefineTransient & {
  singleton: DefineSingleton;
  scoped: DefineScoped;
};

export const fn: DefineFn = Object.assign(transientFn, {
  singleton: fnDefinition(LifeTime.singleton),
  scoped: fnDefinition(LifeTime.scoped),
});
