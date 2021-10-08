import { AnyInstanceDefinition } from "../definitions/abstract/AnyInstanceDefinition";

export const replace = <
  TInstance,
  TNextInstance extends TInstance,
  TNextInstanceDef extends AnyInstanceDefinition<TInstance>,
>(
  instance: AnyInstanceDefinition<TInstance>,
  newInstance: TNextInstanceDef,
): TNextInstanceDef => {
  return {
    ...newInstance,
    id: instance.id,
  };
};
