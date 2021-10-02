import { DecoratorDefinition, InstanceDefinition } from '../strategies/abstract/InstanceDefinition';
import { DecoratorStrategy } from '../strategies/DecoratorStrategy';

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
