import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { InstanceDefinition, isInstanceDef } from '../definitions/abstract/InstanceDefinition.js';

// export function set<T, TInstance, TLifeTime extends LifeTime, TMeta>(
//   definition: InstanceDefinition<TInstance, TLifeTime, TMeta>,
//   newValue: TInstance,
// ): InstanceDefinition<TInstance, TLifeTime, TMeta>;
//
// export function set<T, TInstance, TLifeTime extends LifeTime, TMeta>(
//   definition: InstanceDefinition<TInstance, TLifeTime, TMeta>,
//   newValue: TInstance,
// ): InstanceDefinition<TInstance, TLifeTime, TMeta>;

export function set<T, TInstance, TLifeTime extends LifeTime, TMeta>(
  definition: InstanceDefinition<TInstance, TLifeTime, TMeta>,
  newValue: TInstance,
): InstanceDefinition<TInstance, TLifeTime, TMeta> {
  // if (!isInstanceDef(definition) && !isAsyncInstanceDef(definition)) {
  //   throw new Error(`Invalid definition provided.`);
  // }

  return {
    ...definition,
    create: () => newValue,
  } as any;
}
