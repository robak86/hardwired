import { ClassType } from '../../utils/ClassType';
import { AnyInstanceDefinition } from '../abstract/AnyInstanceDefinition';
import { AsyncInstanceDefinition, buildAsyncClassDefinition } from '../abstract/AsyncInstanceDefinition';

type ClassDefinitionBuildFn = {
  <TInstance, TDeps extends any[], TArgs extends any[]>(
    cls: ClassType<TInstance, TArgs>,
    ...args: { [K in keyof TArgs]: AnyInstanceDefinition<TArgs[K]> }
  ): AsyncInstanceDefinition<TInstance, any>;
};

export const asyncClassDefinition = (strategy: symbol): ClassDefinitionBuildFn => {
  return (cls, ...dependencies) => {
    return buildAsyncClassDefinition(cls, strategy, dependencies as any);
  };
};
