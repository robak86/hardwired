import { ConstDefinition, DecoratorDefinition, InstanceDefinition } from './InstanceDefinition';
import { ConstStrategy } from '../strategies/ConstStrategy';
import { DecoratorStrategy } from '../strategies/DecoratorStrategy';

export const set = <TInstance>(instance: InstanceDefinition<TInstance>, newValue: TInstance): ConstDefinition<TInstance> => {
  return {
    ...instance,
    type: 'const',
    strategy: ConstStrategy.type,
    value: newValue,
  };
};

export const replace = <TInstance, TNextInstance extends TInstance, TNextInstanceDef extends InstanceDefinition<TInstance>>(
  instance: InstanceDefinition<TInstance>,
  newInstance: TNextInstanceDef,
): TNextInstanceDef => {
  return {
    ...newInstance,
    id: instance.id,
  };
};

export function decorate<TInstance, TNextValue extends TInstance>(
  instance: InstanceDefinition<TInstance>,
  decorator: (prevValue: TInstance) => TNextValue,
): DecoratorDefinition<TInstance>;
export function decorate<TInstance, TNextValue extends TInstance, TDecoratorDeps extends any[]>(
  instance: InstanceDefinition<TInstance>,
  decorator: (prevValue: TInstance, ...TDecoratorDeps) => TNextValue,
  args: TDecoratorDeps,
): DecoratorDefinition<TInstance>;
export function decorate<TInstance, TNextValue extends TInstance, TDecoratorDeps extends any[]>(
  instance: InstanceDefinition<TInstance>,
  decorator: (prevValue: TInstance, ...TDecoratorDeps) => TNextValue,
  args?: TDecoratorDeps,
): DecoratorDefinition<TInstance> {
  return {
    ...instance,
    type: 'decorator',
    strategy: DecoratorStrategy.type,
    decorator: decorator,
    decorated: instance,
    dependencies: args ?? [],
  };
}


// TODO: add support for injecting deps into applyFn
export const apply = <TInstance, TNextValue extends TInstance>(
  instance: InstanceDefinition<TInstance>,
  applyFn: (prevValue: TInstance) => void,
): DecoratorDefinition<TInstance> => {
  return {
    ...instance,
    type: 'decorator',
    strategy: DecoratorStrategy.type,
    decorator: (value, ...rest:any[]) => {
      applyFn(value);
      return value;
    },
    decorated: instance,
    dependencies: []
  };
};
