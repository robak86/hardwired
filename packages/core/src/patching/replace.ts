import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { BoundDefinition } from '../definitions/abstract/FnDefinition.js';

export const replace = <
  TInstance,
  TNextInstance extends TInstance,
  TNextInstanceDef extends AnyInstanceDefinition<TInstance, any, any>,
>(
  instance: AnyInstanceDefinition<TInstance, any, any>,
  newInstance: TNextInstanceDef,
): TNextInstanceDef => {
  return {
    ...newInstance,
    id: instance.id,
  };
};

export const replaceFn = <
  TInstance,
  TNextInstance extends TInstance,
  TNextInstanceDef extends BoundDefinition<TInstance, any, any>,
>(
  instance: BoundDefinition<TInstance, any, any>,
  newInstance: TNextInstanceDef,
): TNextInstanceDef => {
  return {
    ...newInstance,
    id: instance.id,
  };
};
