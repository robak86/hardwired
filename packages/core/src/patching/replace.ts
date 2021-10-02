import { InstanceDefinition } from '../strategies/abstract/InstanceDefinition';

export const replace = <
  TInstance,
  TNextInstance extends TInstance,
  TNextInstanceDef extends InstanceDefinition<TInstance>,
>(
  instance: InstanceDefinition<TInstance>,
  newInstance: TNextInstanceDef,
): TNextInstanceDef => {
  return {
    ...newInstance,
    id: instance.id,
  };
};
