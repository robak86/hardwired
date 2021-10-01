import { ClassType } from '../utils/ClassType';

import { v4 } from 'uuid';
import { ClassSingletonStrategy } from '../strategies/ClassSingletonStrategy';
import { ClassRequestStrategy } from '../strategies/ClassRequestStrategy';
import { ClassTransientStrategy } from '../strategies/ClassTransientStrategy';
import { ConstStrategy } from '../strategies/ConstStrategy';
import { InstanceEntry } from './InstanceEntry';
import { FactoryFunctionSingletonStrategy } from "../strategies/FactoryFunctionSingletonStrategy";

const classInstanceEntry = (strategy: symbol) => {
  return <TValue, TDeps extends any[]>(
    cls: ClassType<TValue, TDeps>,
    dependencies: { [K in keyof TDeps]: InstanceEntry<TDeps[K]> },
  ): InstanceEntry<TValue> => {
    return {
      id: v4(),
      strategy,
      target: cls,
      dependencies,
    };
  };
};

export const classSingleton = classInstanceEntry(ClassSingletonStrategy.type);
export const classRequest = classInstanceEntry(ClassRequestStrategy.type);
export const classTransient = classInstanceEntry(ClassTransientStrategy.type);

export const value = <TValue, TDeps extends any[]>(cls: TValue): InstanceEntry<TValue> => {
  return {
    id: v4(),
    strategy: ConstStrategy.type,
    target: cls,
    dependencies: [],
  };
};

export const factoryFn = <TValue, TDeps extends any[]>(factory: () => TValue): InstanceEntry<TValue> => {
  return {
    id: v4(),
    strategy: FactoryFunctionSingletonStrategy.type,
    target: factory,
    dependencies: [],
  };
};
