import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { Resolution } from '../definitions/abstract/Resolution.js';
import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition.js';
import { AsyncInstanceDefinition } from '../definitions/abstract/async/AsyncInstanceDefinition.js';

export function set<T, TInstance, TLifeTime extends LifeTime>(
  instance: InstanceDefinition<TInstance, TLifeTime>,
  newValue: TInstance,
): InstanceDefinition<TInstance, TLifeTime>;

export function set<T, TInstance, TLifeTime extends LifeTime>(
  instance: AsyncInstanceDefinition<TInstance, TLifeTime>,
  newValue: TInstance,
): AsyncInstanceDefinition<TInstance, TLifeTime>;

export function set<T, TInstance, TLifeTime extends LifeTime, TResolution extends Resolution>(
  instance: AnyInstanceDefinition<TInstance, TLifeTime>,
  newValue: TInstance,
): AnyInstanceDefinition<TInstance, TLifeTime> {
  return {
    ...instance,
    create: () => newValue,
  } as any;
}
