import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { functionDefinition, FunctionFactoryDefinition } from '../abstract/InstanceDefinition/FunctionDefinition';
import { PartialInstancesDefinitionsArgs, PartiallyAppliedDefinition } from '../../utils/PartiallyApplied';
import {
  partiallyAppliedFnDefinition,
  PartiallyAppliedFunctionDefinition,
} from '../abstract/InstanceDefinition/PartiallyAppliedFunctionDefinition';

export type FunctionDefinitionBuildFn = {
  <TValue, TDeps extends any[], TFunctionArgs extends any[]>(
    factory: (...args: TFunctionArgs) => TValue,
    ...args: { [K in keyof TFunctionArgs]: InstanceDefinition<TFunctionArgs[K]> }
  ): FunctionFactoryDefinition<TValue>;
};

export const fnDefinition = (strategy: symbol): FunctionDefinitionBuildFn => {
  return (factory, ...args) => {
    return functionDefinition(factory, strategy, args);
  };
};

export type PartiallyAppliedFnBuild = {
  <TValue, TArgs extends any[], TProvidedArgs extends PartialInstancesDefinitionsArgs<TArgs>>(
    factory: (...args: TArgs) => TValue,
    ...args: TProvidedArgs
  ): PartiallyAppliedFunctionDefinition<PartiallyAppliedDefinition<TArgs, TProvidedArgs, TValue>>;
};

export const partiallyAppliedDefinition = (strategy: symbol):PartiallyAppliedFnBuild => {
  return (factory, ...args) => {
    return partiallyAppliedFnDefinition(strategy, factory, args, undefined) as any;
  };
}
