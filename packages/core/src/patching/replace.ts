import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { FnDefinition } from '../definitions/abstract/FnDefinition.js';

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
  TNextInstanceDef extends FnDefinition<TInstance, any, any>,
>(
  instance: FnDefinition<TInstance, any, any>,
  newInstance: TNextInstanceDef,
): TNextInstanceDef => {
  return {
    ...newInstance,
    id: instance.id,
  };
};
