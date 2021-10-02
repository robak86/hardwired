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
  functionDefinition,
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
    return classDefinition(cls, strategy, dependencies ?? ([] as any));
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
  return functionDefinition(factory, SingletonStrategy.type, args ?? ([] as any));
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
  return functionDefinition(factory, TransientStrategy.type, args ?? ([] as any));
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
  return functionDefinition(factory, RequestStrategy.type, args ?? ([] as any));
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
  return functionDefinition(factory, ScopeStrategy.type, args ?? ([] as any));
}
