import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition.js';

export const replace = <
  TInstance,
  TNextInstance extends TInstance,
  TNextInstanceDef extends InstanceDefinition<TInstance, any, any>,
>(
  instance: InstanceDefinition<TInstance, any, any>,
  newInstance: TNextInstanceDef,
): TNextInstanceDef => {
  return {
    ...newInstance,
    id: instance.id,
  };
};
