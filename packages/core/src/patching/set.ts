import { ConstDefinition, InstanceDefinition } from '../strategies/abstract/InstanceDefinition';
import { ConstStrategy } from '../strategies/ConstStrategy';

export const set = <TInstance>(instance: InstanceDefinition<TInstance>, newValue: TInstance): ConstDefinition<TInstance> => {
  return {
    ...instance,
    type: 'const',
    strategy: ConstStrategy.type,
    value: newValue,
  };
};


