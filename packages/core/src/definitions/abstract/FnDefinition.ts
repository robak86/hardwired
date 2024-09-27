import { LifeTime } from './LifeTime.js';

import { v4 } from 'uuid';
import { IServiceLocator } from '../../container/IContainer.js';
import { Definition } from './Definition.js';

export const fnDefinition =
  <TLifeTime extends LifeTime>(lifeTime: TLifeTime) =>
  <TInstance>(create: (locator: IServiceLocator<TLifeTime>) => TInstance): Definition<TInstance, TLifeTime, []> => {
    return new Definition(v4(), lifeTime, create);
  };

export function transientFn<TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
  create: (locator: IServiceLocator<TLifeTime>, ...args: TArgs) => TInstance,
): Definition<TInstance, LifeTime.transient, TArgs> {
  return new Definition(v4(), LifeTime.transient, create);
}
