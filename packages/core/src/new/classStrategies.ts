import { ClassType } from '../utils/ClassType';

import { v4 } from 'uuid';
import { SingletonStrategy } from '../strategies/SingletonStrategy';
import { RequestStrategy } from '../strategies/RequestStrategy';
import { TransientStrategy } from '../strategies/TransientStrategy';
import { ConstStrategy } from '../strategies/ConstStrategy';
import { ClassInstanceDefinition, ConstDefinition, FunctionFactoryDefinition, InstanceEntry } from './InstanceEntry';
import { FactoryFunctionSingletonStrategy } from '../strategies/FactoryFunctionSingletonStrategy';

const classInstanceEntry = (strategy: symbol) => {
  return <TValue, TDeps extends any[]>(
    cls: ClassType<TValue, TDeps>,
    dependencies: { [K in keyof TDeps]: InstanceEntry<TDeps[K]> },
  ): ClassInstanceDefinition<TValue> => {
    return {
      id: v4(),
      kind: 'class',
      strategy,
      class: cls,
      dependencies,
    };
  };
};

export const classSingleton = classInstanceEntry(SingletonStrategy.type);
export const classRequest = classInstanceEntry(RequestStrategy.type);
export const classTransient = classInstanceEntry(TransientStrategy.type);

export const value = <TValue, TDeps extends any[]>(value: TValue): ConstDefinition<TValue> => {
  return {
    id: v4(),
    kind: 'const',
    strategy: ConstStrategy.type,
    value,
  };
};

export function factoryFn<TValue, TDeps extends any[]>(factory: () => TValue): FunctionFactoryDefinition<TValue>;
export function factoryFn<TValue, TDeps extends any[], TFunctionArgs extends any[]>(
  factory: (...args: TFunctionArgs) => TValue,
  args: { [K in keyof TFunctionArgs]: InstanceEntry<TFunctionArgs[K]> },
): FunctionFactoryDefinition<TValue>;
export function factoryFn<TValue, TDeps extends any[], TFunctionArgs extends any[]>(
  factory: (...args: TFunctionArgs) => TValue,
  args?: { [K in keyof TFunctionArgs]: InstanceEntry<TFunctionArgs[K]> },
): FunctionFactoryDefinition<TValue> {
  return {
    id: v4(),
    kind: 'functionFactory',
    strategy: FactoryFunctionSingletonStrategy.type,
    factory: factory as any,
    dependencies: [],
  };
}
