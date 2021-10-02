import { ClassType } from '../../utils/ClassType';

import { v4 } from 'uuid';
import { SingletonStrategy } from '../SingletonStrategy';
import { RequestStrategy } from '../RequestStrategy';
import { TransientStrategy } from '../TransientStrategy';
import { ConstStrategy } from '../ConstStrategy';
import {
  classDefinition,
  ClassInstanceDefinition,
  ConstDefinition,
  functionDefinition,
  FunctionFactoryDefinition,
  InstanceDefinition,
} from '../../new/InstanceDefinition';
import { ScopeStrategy } from '../ScopeStrategy';

const classDefinitionBuilder = (strategy: symbol) => {
  return buildDefinition;

  function buildDefinition<TValue>(cls: ClassType<TValue, []>): ClassInstanceDefinition<TValue>;
  function buildDefinition<TValue, TDeps extends any[]>(
    cls: ClassType<TValue, TDeps>,
    dependencies: { [K in keyof TDeps]: InstanceDefinition<TDeps[K]> },
  ): ClassInstanceDefinition<TValue>;
  function buildDefinition<TValue, TDeps extends any[]>(
    cls: ClassType<TValue, TDeps>,
    dependencies?: { [K in keyof TDeps]: InstanceDefinition<TDeps[K]> },
  ): ClassInstanceDefinition<TValue> {
    return classDefinition(cls, strategy, dependencies ?? ([] as any));
  }
};

export const classSingleton = classDefinitionBuilder(SingletonStrategy.type);
export const classRequest = classDefinitionBuilder(RequestStrategy.type);
export const classTransient = classDefinitionBuilder(TransientStrategy.type);
export const classScoped = classDefinitionBuilder(ScopeStrategy.type);

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
  args: { [K in keyof TFunctionArgs]: InstanceDefinition<TFunctionArgs[K]> },
): FunctionFactoryDefinition<TValue>;
export function singletonFn<TValue, TDeps extends any[], TFunctionArgs extends any[]>(
  factory: (...args: TFunctionArgs) => TValue,
  args?: { [K in keyof TFunctionArgs]: InstanceDefinition<TFunctionArgs[K]> },
): FunctionFactoryDefinition<TValue> {
  return functionDefinition(factory, SingletonStrategy.type, args ?? ([] as any));
}

export function transientFn<TValue, TDeps extends any[]>(factory: () => TValue): FunctionFactoryDefinition<TValue>;
export function transientFn<TValue, TDeps extends any[], TFunctionArgs extends any[]>(
  factory: (...args: TFunctionArgs) => TValue,
  args: { [K in keyof TFunctionArgs]: InstanceDefinition<TFunctionArgs[K]> },
): FunctionFactoryDefinition<TValue>;
export function transientFn<TValue, TDeps extends any[], TFunctionArgs extends any[]>(
  factory: (...args: TFunctionArgs) => TValue,
  args?: { [K in keyof TFunctionArgs]: InstanceDefinition<TFunctionArgs[K]> },
): FunctionFactoryDefinition<TValue> {
  return functionDefinition(factory, TransientStrategy.type, args ?? ([] as any));
}

export function requestFn<TValue, TDeps extends any[]>(factory: () => TValue): FunctionFactoryDefinition<TValue>;
export function requestFn<TValue, TDeps extends any[], TFunctionArgs extends any[]>(
  factory: (...args: TFunctionArgs) => TValue,
  args: { [K in keyof TFunctionArgs]: InstanceDefinition<TFunctionArgs[K]> },
): FunctionFactoryDefinition<TValue>;
export function requestFn<TValue, TDeps extends any[], TFunctionArgs extends any[]>(
  factory: (...args: TFunctionArgs) => TValue,
  args?: { [K in keyof TFunctionArgs]: InstanceDefinition<TFunctionArgs[K]> },
): FunctionFactoryDefinition<TValue> {
  return functionDefinition(factory, RequestStrategy.type, args ?? ([] as any));
}

export function scopedFn<TValue, TDeps extends any[]>(factory: () => TValue): FunctionFactoryDefinition<TValue>;
export function scopedFn<TValue, TDeps extends any[], TFunctionArgs extends any[]>(
  factory: (...args: TFunctionArgs) => TValue,
  args: { [K in keyof TFunctionArgs]: InstanceDefinition<TFunctionArgs[K]> },
): FunctionFactoryDefinition<TValue>;
export function scopedFn<TValue, TDeps extends any[], TFunctionArgs extends any[]>(
  factory: (...args: TFunctionArgs) => TValue,
  args?: { [K in keyof TFunctionArgs]: InstanceDefinition<TFunctionArgs[K]> },
): FunctionFactoryDefinition<TValue> {
  return functionDefinition(factory, ScopeStrategy.type, args ?? ([] as any));
}
