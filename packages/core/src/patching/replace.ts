import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';

export const replace = <
  TInstance,
  TNextInstance extends TInstance,
  TNextInstanceDef extends AnyInstanceDefinition<TInstance, any>,
>(
  instance: AnyInstanceDefinition<TInstance, any>,
  newInstance: TNextInstanceDef,
): TNextInstanceDef => {
  return {
    ...newInstance,
    id: instance.id,
  };
};
