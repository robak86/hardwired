import type { IContainer } from '../container/IContainer.js';

import { LifeTime } from './abstract/LifeTime.js';
import { Definition } from './impl/Definition.js';
import { ReaderDefinition } from './impl/ReaderDefinition.js';

export const fnDefinition =
  <TLifeTime extends LifeTime>(lifeTime: TLifeTime) =>
  <TInstance>(create: (locator: IContainer<TLifeTime>) => TInstance): Definition<TInstance, TLifeTime, []> => {
    return new Definition(Symbol(), lifeTime, create);
  };

export function transientFn<TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
  create: (locator: IContainer<TLifeTime>, ...args: TArgs) => TInstance,
): ReaderDefinition<TInstance, TArgs> {
  return new ReaderDefinition(Symbol(), create);
}

export type DefineTransient = <TInstance, TArgs extends any[]>(
  create: (locator: IContainer<LifeTime.transient>, ...args: TArgs) => TInstance,
) => ReaderDefinition<TInstance, TArgs>;

export type DefineScoped = <TInstance>(
  create: (locator: IContainer<LifeTime.scoped>) => TInstance,
) => Definition<TInstance, LifeTime.scoped, []>;

export type DefineSingleton = <TInstance>(
  create: (locator: IContainer<LifeTime.singleton>) => TInstance,
) => Definition<TInstance, LifeTime.singleton, []>;

export type DefineFn = DefineTransient & {
  singleton: DefineSingleton;
  scoped: DefineScoped;
};

export const fn: DefineFn = Object.assign(transientFn, {
  singleton: fnDefinition(LifeTime.singleton),
  scoped: fnDefinition(LifeTime.scoped),
});
