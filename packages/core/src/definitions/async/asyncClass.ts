import { ClassType } from '../../utils/ClassType';
import { AnyInstanceDefinition } from '../abstract/AnyInstanceDefinition';
import { AsyncInstanceDefinition } from '../abstract/AsyncInstanceDefinition';
import { v4 } from 'uuid';
import { PickExternals } from "../../utils/PickExternals";

type ClassDefinitionBuildFn = {
  <TInstance, TArgs extends any[], TDeps extends { [K in keyof TArgs]: AnyInstanceDefinition<TArgs[K], any> }>(
    cls: ClassType<TInstance, TArgs>,
    ...args: TDeps
  ): AsyncInstanceDefinition<TInstance, PickExternals<TDeps>>;
};

export const asyncClass = (strategy: symbol): ClassDefinitionBuildFn => {
  return (cls, ...dependencies) => {
    return {
      id: v4(),
      strategy,
      isAsync: true,
      externals: dependencies.flatMap(def => def.externals), // TODO: externalIds shouldn't have duplicates
      create: async context => {
        const dependenciesInstance = await Promise.all((dependencies as any).map(context.buildWithStrategy));
        return new cls(...(dependenciesInstance as any));
      },
      meta: undefined,
    };
  };
};
