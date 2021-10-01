import { InstanceEntry } from './InstanceEntry';
import { ConstStrategy } from '../strategies/ConstStrategy';

export const set = <TInstance>(instance: InstanceEntry<TInstance>, newValue: TInstance): InstanceEntry<TInstance> => {
  return {
    ...instance,
    strategy: ConstStrategy.type,
    dependencies: [],
    target: newValue,
  };
};

export const decorate = <TInstance, TNextValue extends TInstance>(
  instance: InstanceEntry<TInstance>,
  decorator: (prevValue: TInstance) => TNextValue,
): InstanceEntry<TInstance> => {
  return {
    ...instance,
    strategy: ConstStrategy.type,
    dependencies: [],
    target: decorator,
    prev: instance,
  };
};
