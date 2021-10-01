import { ConstDefinition, DecoratorDefinition, InstanceEntry } from './InstanceEntry';
import { ConstStrategy } from '../strategies/ConstStrategy';

export const set = <TInstance>(instance: InstanceEntry<TInstance>, newValue: TInstance): ConstDefinition<TInstance> => {
  return {
    ...instance,
    kind: 'const',
    strategy: ConstStrategy.type,
    value: newValue,
  };
};

export const replace = <TInstance, TNextInstance extends TInstance, TNextInstanceDef extends InstanceEntry<TInstance>>(
  instance: InstanceEntry<TInstance>,
  newInstance: TNextInstanceDef,
): TNextInstanceDef => {
  return {
    ...newInstance,
    id: instance.id,
  };
};

export const decorate = <TInstance, TNextValue extends TInstance>(
  instance: InstanceEntry<TInstance>,
  decorator: (prevValue: TInstance) => TNextValue,
): DecoratorDefinition<TInstance> => {
  return {
    ...instance,
    kind: 'decorator',
    strategy: ConstStrategy.type,
    decorator: decorator,
    decorated: instance,
  };
};

export const apply = <TInstance, TNextValue extends TInstance>(
  instance: InstanceEntry<TInstance>,
  applyFn: (prevValue: TInstance) => void,
): DecoratorDefinition<TInstance> => {
  return {
    ...instance,
    kind: 'decorator',
    strategy: ConstStrategy.type,
    decorator: value => {
      applyFn(value);
      return value;
    },
    decorated: instance,
  };
};
