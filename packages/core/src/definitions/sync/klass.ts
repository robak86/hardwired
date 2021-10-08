import { ClassType } from '../../utils/ClassType';
import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';

type ClassDefinitionBuildFn = {
  <TInstance, TDeps extends any[], TArgs extends any[]>(
    cls: ClassType<TInstance, TArgs>,
    ...args: { [K in keyof TArgs]: InstanceDefinition<TArgs[K]> }
  ): InstanceDefinition<TInstance>;
};

export const klass = (strategy: symbol): ClassDefinitionBuildFn => {
  return (cls, ...dependencies) => {
    return {
      id: v4(),
      strategy,
      isAsync: false,
      create: build => {
        return new cls(...(dependencies.map(build) as any));
      },
      meta: undefined as any,
    };
  };
};
