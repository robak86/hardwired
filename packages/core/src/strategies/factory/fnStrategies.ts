import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { TransientStrategy } from '../TransientStrategy';
import { SingletonStrategy } from '../SingletonStrategy';
import { RequestStrategy } from '../RequestStrategy';
import { ScopeStrategy } from '../ScopeStrategy';
import { functionDefinition, FunctionFactoryDefinition } from "../abstract/InstanceDefinition/FunctionDefinition";

export type FunctionDefinitionBuildFn = {
  <TValue>(factory: () => TValue): FunctionFactoryDefinition<TValue>;
  <TValue, TDeps extends any[], TArg>(
    factory: (...args: [TArg]) => TValue,
    args: [InstanceDefinition<TArg>],
  ): FunctionFactoryDefinition<TValue>;
  <TValue, TDeps extends any[], TArg, TFunctionArgs extends [TArg, ...TArg[]]>(
    factory: (...args: TFunctionArgs) => TValue,
    args: { [K in keyof TFunctionArgs]: InstanceDefinition<TFunctionArgs[K]> },
  ): FunctionFactoryDefinition<TValue>;
};

export const singletonFn: FunctionDefinitionBuildFn = (factory, args?) => {
  return functionDefinition(factory, SingletonStrategy.type, args ?? []);
};

export const transientFn: FunctionDefinitionBuildFn = (factory, args?) => {
  return functionDefinition(factory, TransientStrategy.type, args ?? []);
};

export const requestFn: FunctionDefinitionBuildFn = (factory, args?) => {
  return functionDefinition(factory, RequestStrategy.type, args ?? []);
};

export const scopedFn: FunctionDefinitionBuildFn = (factory, args?) => {
  return functionDefinition(factory, ScopeStrategy.type, args ?? []);
};
