import { InstanceDefinition } from '../definitions/InstanceDefinition';

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
