import { LifeTime } from './LifeTime.js';

import { v4 } from 'uuid';
import { IServiceLocator } from '../../container/IContainer.js';
import { BaseDefinition } from './BaseDefinition.js';

export const fnDefinition =
  <TLifeTime extends LifeTime>(lifeTime: TLifeTime) =>
  <TInstance>(create: (locator: IServiceLocator<TLifeTime>) => TInstance): BaseDefinition<TInstance, TLifeTime, []> => {
    return new BaseDefinition(v4(), lifeTime, create);
  };

export function transientFn<TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
  create: (locator: IServiceLocator<TLifeTime>, ...args: TArgs) => TInstance,
): BaseDefinition<TInstance, LifeTime.transient, TArgs> {
  return new BaseDefinition(v4(), LifeTime.transient, create);
}
