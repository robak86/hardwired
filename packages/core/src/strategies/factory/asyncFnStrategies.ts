import { AnyInstanceDefinition } from '../abstract/AnyInstanceDefinition';
import { AsyncSingletonStrategy } from '../AsyncSingletonStrategy';
import {
  asyncFunctionDefinition,
  AsyncFunctionFactoryDefinition
} from '../abstract/AsyncInstanceDefinition/AsyncFunctionDefinition';

export type AsyncFunctionDefinitionBuildFn = {
  <TValue, TDeps extends any[], TFunctionArgs extends any[]>(
    factory: (...args: TFunctionArgs) => Promise<TValue>,
    ...args: { [K in keyof TFunctionArgs]: AnyInstanceDefinition<TFunctionArgs[K]> }
  ): AsyncFunctionFactoryDefinition<TValue>;
};

export const asyncSingletonFn: AsyncFunctionDefinitionBuildFn = (factory, ...args) => {
  return asyncFunctionDefinition(factory, AsyncSingletonStrategy.type, args);
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
