import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { TransientStrategy } from '../TransientStrategy';
import { SingletonStrategy } from '../SingletonStrategy';
import { RequestStrategy } from '../RequestStrategy';
import { ScopeStrategy } from '../ScopeStrategy';
import { functionDefinition, FunctionFactoryDefinition } from '../abstract/InstanceDefinition/FunctionDefinition';
import { PartialInstancesDefinitionsArgs, PartiallyAppliedDefinition } from '../../utils/PartiallyApplied';
import {
  partiallyAppliedFnDefinition,
  PartiallyAppliedFunctionDefinition,
} from '../abstract/InstanceDefinition/PartiallyAppliedFunctionDefinition';

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

export type PartiallyAppliedFnBuild = {
  <TValue, TArgs extends any[], TProvidedArgs extends PartialInstancesDefinitionsArgs<TArgs>>(
    factory: (...args: TArgs) => TValue,
    ...args: TProvidedArgs
  ): PartiallyAppliedFunctionDefinition<PartiallyAppliedDefinition<TArgs, TProvidedArgs, TValue>>;
};

export const partiallyAppliedSingleton: PartiallyAppliedFnBuild = (factory, ...args) => {
  return partiallyAppliedFnDefinition(SingletonStrategy.type, factory, args, undefined) as any;
};

export const partiallyAppliedTransient: PartiallyAppliedFnBuild = (factory, ...args) => {
  return partiallyAppliedFnDefinition(TransientStrategy.type, factory, args, undefined) as any;
};

export const partiallyAppliedRequest: PartiallyAppliedFnBuild = (factory, ...args) => {
  return partiallyAppliedFnDefinition(RequestStrategy.type, factory, args, undefined) as any;
};

export const partiallyAppliedScoped: PartiallyAppliedFnBuild = (factory, ...args) => {
  return partiallyAppliedFnDefinition(ScopeStrategy.type, factory, args, undefined) as any;
};
