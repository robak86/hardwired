import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { BaseDefinition } from '../definitions/abstract/FnDefinition.js';

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
  TNextInstanceDef extends BaseDefinition<TInstance, any, any>,
>(
  instance: BaseDefinition<TInstance, any, any>,
  newInstance: TNextInstanceDef,
): TNextInstanceDef => {
  return {
    ...newInstance,
    id: instance.id,
  };
};
