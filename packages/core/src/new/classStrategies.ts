import { ClassType } from '../utils/ClassType';

import { v4 } from 'uuid';
import { SingletonStrategy } from '../strategies/SingletonStrategy';
import { RequestStrategy } from '../strategies/RequestStrategy';
import { TransientStrategy } from '../strategies/TransientStrategy';
import { ConstStrategy } from '../strategies/ConstStrategy';
import {
  classDefinition,
  ClassInstanceDefinition,
  ConstDefinition,
  FunctionFactoryDefinition,
  InstanceEntry,
} from './InstanceEntry';
import { ScopeStrategy } from '../strategies/ScopeStrategy';

const classInstanceEntry = (strategy: symbol) => {
  return buildDefinition;

  function buildDefinition<TValue>(cls: ClassType<TValue, []>): ClassInstanceDefinition<TValue>;
  function buildDefinition<TValue, TDeps extends any[]>(
    cls: ClassType<TValue, TDeps>,
    dependencies: { [K in keyof TDeps]: InstanceEntry<TDeps[K]> },
  ): ClassInstanceDefinition<TValue>;
  function buildDefinition<TValue, TDeps extends any[]>(
    cls: ClassType<TValue, TDeps>,
    dependencies?: { [K in keyof TDeps]: InstanceEntry<TDeps[K]> },
  ): ClassInstanceDefinition<TValue> {
    return classDefinition(cls, strategy, dependencies ?? [] as any);
  }
};

export const classSingleton = classInstanceEntry(SingletonStrategy.type);
export const classRequest = classInstanceEntry(RequestStrategy.type);
export const classTransient = classInstanceEntry(TransientStrategy.type);
export const classScoped = classInstanceEntry(ScopeStrategy.type);

export const value = <TValue, TDeps extends any[]>(value: TValue): ConstDefinition<TValue> => {
  return {
    id: v4(),
    type: 'const',
    strategy: ConstStrategy.type,
    value,
  };
};

export function singletonFn<TValue, TDeps extends any[]>(factory: () => TValue): FunctionFactoryDefinition<TValue>;
export function singletonFn<TValue, TDeps extends any[], TFunctionArgs extends any[]>(
  factory: (...args: TFunctionArgs) => TValue,
  args: { [K in keyof TFunctionArgs]: InstanceEntry<TFunctionArgs[K]> },
): FunctionFactoryDefinition<TValue>;
export function singletonFn<TValue, TDeps extends any[], TFunctionArgs extends any[]>(
  factory: (...args: TFunctionArgs) => TValue,
  args?: { [K in keyof TFunctionArgs]: InstanceEntry<TFunctionArgs[K]> },
): FunctionFactoryDefinition<TValue> {
  return {
    id: v4(),
    type: 'function',
    strategy: SingletonStrategy.type, // TODO: multiple strategies available for factory function - group builders by lifetime ?   singleton.class|fn|curry transient.class|fn, singleton: - fn seems to be
    factory: factory as any,
    dependencies: args as any,
  };
}

export function transientFn<TValue, TDeps extends any[]>(factory: () => TValue): FunctionFactoryDefinition<TValue>;
export function transientFn<TValue, TDeps extends any[], TFunctionArgs extends any[]>(
  factory: (...args: TFunctionArgs) => TValue,
  args: { [K in keyof TFunctionArgs]: InstanceEntry<TFunctionArgs[K]> },
): FunctionFactoryDefinition<TValue>;
export function transientFn<TValue, TDeps extends any[], TFunctionArgs extends any[]>(
  factory: (...args: TFunctionArgs) => TValue,
  args?: { [K in keyof TFunctionArgs]: InstanceEntry<TFunctionArgs[K]> },
): FunctionFactoryDefinition<TValue> {
  return {
    id: v4(),
    type: 'function',
    strategy: TransientStrategy.type, // TODO: multiple strategies available for factory function - group builders by lifetime ?   singleton.class|fn|curry transient.class|fn, singleton: - fn seems to be
    factory: factory as any,
    dependencies: args as any,
  };
}

export function requestFn<TValue, TDeps extends any[]>(factory: () => TValue): FunctionFactoryDefinition<TValue>;
export function requestFn<TValue, TDeps extends any[], TFunctionArgs extends any[]>(
  factory: (...args: TFunctionArgs) => TValue,
  args: { [K in keyof TFunctionArgs]: InstanceEntry<TFunctionArgs[K]> },
): FunctionFactoryDefinition<TValue>;
export function requestFn<TValue, TDeps extends any[], TFunctionArgs extends any[]>(
  factory: (...args: TFunctionArgs) => TValue,
  args?: { [K in keyof TFunctionArgs]: InstanceEntry<TFunctionArgs[K]> },
): FunctionFactoryDefinition<TValue> {
  return {
    id: v4(),
    type: 'function',
    strategy: RequestStrategy.type, // TODO: multiple strategies available for factory function - group builders by lifetime ?   singleton.class|fn|curry transient.class|fn, singleton: - fn seems to be
    factory: factory as any,
    dependencies: args as any,
  };
}

export function scopedFn<TValue, TDeps extends any[]>(factory: () => TValue): FunctionFactoryDefinition<TValue>;
export function scopedFn<TValue, TDeps extends any[], TFunctionArgs extends any[]>(
  factory: (...args: TFunctionArgs) => TValue,
  args: { [K in keyof TFunctionArgs]: InstanceEntry<TFunctionArgs[K]> },
): FunctionFactoryDefinition<TValue>;
export function scopedFn<TValue, TDeps extends any[], TFunctionArgs extends any[]>(
  factory: (...args: TFunctionArgs) => TValue,
  args?: { [K in keyof TFunctionArgs]: InstanceEntry<TFunctionArgs[K]> },
): FunctionFactoryDefinition<TValue> {
  return {
    id: v4(),
    type: 'function',
    strategy: ScopeStrategy.type, // TODO: multiple strategies available for factory function - group builders by lifetime ?   singleton.class|fn|curry transient.class|fn, singleton: - fn seems to be
    factory: factory as any,
    dependencies: args as any,
  };
}
