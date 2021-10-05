import { AnyInstanceDefinition } from '../abstract/AnyInstanceDefinition';
import { AsyncSingletonStrategy } from '../AsyncSingletonStrategy';
import { PartialAnyInstancesDefinitionsArgs, PartiallyAppliedAsyncDefinition } from '../../utils/PartiallyApplied';
import {
  AsyncInstanceDefinition,
  buildAsyncFunctionDefinition,
  buildAsyncPartiallyAppliedFnDefinition
} from '../abstract/AsyncInstanceDefinition';

export type AsyncFunctionDefinitionBuildFn = {
  <TValue, TDeps extends any[], TFunctionArgs extends any[]>(
    factory: (...args: TFunctionArgs) => Promise<TValue>,
    ...args: { [K in keyof TFunctionArgs]: AnyInstanceDefinition<TFunctionArgs[K]> }
  ): AsyncInstanceDefinition<TValue, any>;
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
  ): AsyncInstanceDefinition<PartiallyAppliedAsyncDefinition<TArgs, TProvidedArgs, TValue>, any>;
};

export const asyncPartiallyAppliedDefinition = (strategy: symbol): AsyncPartiallyAppliedFnBuild => {
  return (factory, ...args) => {
    return buildAsyncPartiallyAppliedFnDefinition(strategy, factory, args, undefined) as any;
  };
};
