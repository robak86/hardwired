import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { InstanceDefinition, isInstanceDef } from '../definitions/abstract/sync/InstanceDefinition.js';
import { AsyncInstanceDefinition, isAsyncInstanceDef } from '../definitions/abstract/async/AsyncInstanceDefinition.js';

export function set<T, TInstance, TLifeTime extends LifeTime, TMeta>(
  definition: InstanceDefinition<TInstance, TLifeTime, TMeta>,
  newValue: TInstance,
): InstanceDefinition<TInstance, TLifeTime, TMeta>;

export function set<T, TInstance, TLifeTime extends LifeTime, TMeta>(
  definition: AsyncInstanceDefinition<TInstance, TLifeTime, TMeta>,
  newValue: TInstance,
): AsyncInstanceDefinition<TInstance, TLifeTime, TMeta>;

export function set<T, TInstance, TLifeTime extends LifeTime, TMeta>(
  definition: AnyInstanceDefinition<TInstance, TLifeTime, TMeta>,
  newValue: TInstance,
): AnyInstanceDefinition<TInstance, TLifeTime, TMeta> {
  if (!isInstanceDef(definition) && !isAsyncInstanceDef(definition)) {
    throw new Error(`Invalid definition provided.`);
  }

  return {
    ...definition,
    create: () => newValue,
  } as any;
}
