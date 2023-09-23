import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { InstanceDefinition, isInstanceDef } from '../definitions/abstract/sync/InstanceDefinition.js';
import { AsyncInstanceDefinition, isAsyncInstanceDef } from '../definitions/abstract/async/AsyncInstanceDefinition.js';

export function set<T, TInstance, TLifeTime extends LifeTime>(
  definition: InstanceDefinition<TInstance, TLifeTime>,
  newValue: TInstance,
): InstanceDefinition<TInstance, TLifeTime>;

export function set<T, TInstance, TLifeTime extends LifeTime>(
  definition: AsyncInstanceDefinition<TInstance, TLifeTime>,
  newValue: TInstance,
): AsyncInstanceDefinition<TInstance, TLifeTime>;

export function set<T, TInstance, TLifeTime extends LifeTime>(
  definition: AnyInstanceDefinition<TInstance, TLifeTime>,
  newValue: TInstance,
): AnyInstanceDefinition<TInstance, TLifeTime> {
  if (!isInstanceDef(definition) && !isAsyncInstanceDef(definition)) {
    throw new Error(`Invalid definition provided.`);
  }

  return {
    ...definition,
    create: () => newValue,
  } as any;
}
