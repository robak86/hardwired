import { LifeTime } from './LifeTime.js';
import { IContainer } from '../../container/IContainer.js';
import { Definition } from './Definition.js';

export const fnDefinition =
  <TLifeTime extends LifeTime>(lifeTime: TLifeTime) =>
  <TInstance>(create: (locator: IContainer<TLifeTime>) => TInstance): Definition<TInstance, TLifeTime, []> => {
    return new Definition(Symbol(), lifeTime, create);
  };

export function transientFn<TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
  create: (locator: IContainer<TLifeTime>, ...args: TArgs) => TInstance,
): Definition<TInstance, LifeTime.transient, TArgs> {
  return new Definition(Symbol(), LifeTime.transient, create);
}
