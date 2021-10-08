import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition';

export const set = <TInstance>(
  instance: InstanceDefinition<TInstance>,
  newValue: TInstance,
): InstanceDefinition<TInstance> => {
  return {
    ...instance,
    // strategy: SingletonStrategy.type,
    create: () => newValue,
  };
};
