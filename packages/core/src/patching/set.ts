import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { Resolution } from '../definitions/abstract/Resolution.js';
import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition.js';
import { AsyncInstanceDefinition } from '../definitions/abstract/async/AsyncInstanceDefinition.js';

export function set<T, TInstance, TLifeTime extends LifeTime>(
  instance: InstanceDefinition<TInstance, TLifeTime, any>,
  newValue: TInstance,
): InstanceDefinition<TInstance, TLifeTime, never>;

export function set<T, TInstance, TLifeTime extends LifeTime>(
  instance: AsyncInstanceDefinition<TInstance, TLifeTime, any>,
  newValue: TInstance,
): AsyncInstanceDefinition<TInstance, TLifeTime, never>;

export function set<T, TInstance, TLifeTime extends LifeTime, TResolution extends Resolution>(
  instance: AnyInstanceDefinition<TInstance, TLifeTime, any>,
  newValue: TInstance,
): AnyInstanceDefinition<TInstance, TLifeTime, never> {
  return {
    ...instance,
    create: () => newValue,
  } as any;
}
