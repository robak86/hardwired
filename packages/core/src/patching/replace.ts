import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition';

export const replace = <
  TInstance,
  TNextInstance extends TInstance,
  TNextInstanceDef extends AnyInstanceDefinition<TInstance, any, never>,
>(
  instance: AnyInstanceDefinition<TInstance, any, never>,
  newInstance: TNextInstanceDef,
): TNextInstanceDef => {
  return {
    ...newInstance,
    id: instance.id,
  };
};
