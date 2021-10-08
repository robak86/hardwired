import { ClassType } from '../../utils/ClassType';
import { AnyInstanceDefinition } from '../abstract/AnyInstanceDefinition';
import { AsyncInstanceDefinition } from '../abstract/AsyncInstanceDefinition';
import { v4 } from 'uuid';

type ClassDefinitionBuildFn = {
  <TInstance, TDeps extends any[], TArgs extends any[]>(
    cls: ClassType<TInstance, TArgs>,
    ...args: { [K in keyof TArgs]: AnyInstanceDefinition<TArgs[K]> }
  ): AsyncInstanceDefinition<TInstance, any>;
};

export const asyncClass = (strategy: symbol): ClassDefinitionBuildFn => {
  return (cls, ...dependencies) => {
    return {
      id: v4(),
      strategy,
      isAsync: true,
      create: async build => {
        const dependenciesInstance = await Promise.all((dependencies as any).map(build));
        return new cls(...(dependenciesInstance as any));
      },
      meta: undefined,
    };
  };
};
