import { AnyInstanceDefinition } from '../abstract/AnyInstanceDefinition';
import { AsyncSingletonStrategy } from '../AsyncSingletonStrategy';
import {
  AsyncFunctionFactoryDefinition,
  buildAsyncFunctionDefinition,
} from '../abstract/AsyncInstanceDefinition/AsyncFunctionDefinition';
import {
  PartialAnyInstancesDefinitionsArgs,
  PartialInstancesDefinitionsArgs, PartiallyAppliedAsyncDefinition,
  PartiallyAppliedDefinition
} from '../../utils/PartiallyApplied';
import {
  AsyncPartiallyAppliedDefinition,
  buildAsyncPartiallyAppliedFnDefinition
} from '../abstract/AsyncInstanceDefinition/AsyncPartiallyAppliedDefinition';

export type AsyncFunctionDefinitionBuildFn = {
  <TValue, TDeps extends any[], TFunctionArgs extends any[]>(
    factory: (...args: TFunctionArgs) => Promise<TValue>,
    ...args: { [K in keyof TFunctionArgs]: AnyInstanceDefinition<TFunctionArgs[K]> }
  ): AsyncFunctionFactoryDefinition<TValue>;
};

export const asyncFnDefinition = (strategy: symbol): AsyncFunctionDefinitionBuildFn => {
  return (factory, ...args) => {
    return buildAsyncFunctionDefinition(factory, AsyncSingletonStrategy.type, args);
  };
};

export type AsyncPartiallyAppliedFnBuild = {
  <TValue, TArgs extends any[], TProvidedArgs extends PartialAnyInstancesDefinitionsArgs<TArgs>>(
    factory: (...args: TArgs) => Promise<TValue>,
    ...args: TProvidedArgs
  ): AsyncPartiallyAppliedDefinition<PartiallyAppliedAsyncDefinition<TArgs, TProvidedArgs, TValue>>;
};

export const asyncPartiallyAppliedDefinition = (strategy: symbol): AsyncPartiallyAppliedFnBuild => {
  return (factory, ...args) => {
    return buildAsyncPartiallyAppliedFnDefinition(strategy, factory, args, undefined) as any;
  };
};
//
// export const transientFn: FunctionDefinitionBuildFn = (factory, args?) => {
//   return functionDefinition(factory, TransientStrategy.type, args ?? []);
// };
//
// export const requestFn: FunctionDefinitionBuildFn = (factory, args?) => {
//   return functionDefinition(factory, RequestStrategy.type, args ?? []);
// };
//
// export const scopedFn: FunctionDefinitionBuildFn = (factory, args?) => {
//   return functionDefinition(factory, ScopeStrategy.type, args ?? []);
// };
//
// export type PartiallyAppliedFnBuild = {
//   <TValue, TArgs extends any[], TProvidedArgs extends PartialInstancesDefinitionsArgs<TArgs>>(
//     factory: (...args: TArgs) => TValue,
//     ...args: TProvidedArgs
//   ): PartiallyAppliedFunctionDefinition<PartiallyAppliedDefinition<TArgs, TProvidedArgs, TValue>>;
// };
//
// export const partiallyAppliedSingleton: PartiallyAppliedFnBuild = (factory, ...args) => {
//   return partiallyAppliedFnDefinition(SingletonStrategy.type, factory, args, undefined) as any;
// };
//
// export const partiallyAppliedTransient: PartiallyAppliedFnBuild = (factory, ...args) => {
//   return partiallyAppliedFnDefinition(TransientStrategy.type, factory, args, undefined) as any;
// };
//
// export const partiallyAppliedRequest: PartiallyAppliedFnBuild = (factory, ...args) => {
//   return partiallyAppliedFnDefinition(RequestStrategy.type, factory, args, undefined) as any;
// };
//
// export const partiallyAppliedScoped: PartiallyAppliedFnBuild = (factory, ...args) => {
//   return partiallyAppliedFnDefinition(ScopeStrategy.type, factory, args, undefined) as any;
// };
