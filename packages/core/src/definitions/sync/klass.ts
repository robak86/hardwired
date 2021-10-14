import { ClassType } from '../../utils/ClassType';
import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { pickExternals, PickExternals } from '../../utils/PickExternals';

type ClassDefinitionBuildFn = {
  <TInstance, TArgs extends any[], TDepsInstances extends { [K in keyof TArgs]: InstanceDefinition<TArgs[K], any> }>(
    cls: ClassType<TInstance, TArgs>,
    ...args: TDepsInstances
  ): InstanceDefinition<TInstance, PickExternals<TDepsInstances>>;
};

export const klass = (strategy: symbol): ClassDefinitionBuildFn => {
  return (cls, ...dependencies) => {
    return {
      id: v4(),
      strategy,
      isAsync: false,
      externals: pickExternals(dependencies),
      create: context => {
        return new cls(...(dependencies.map(context.buildWithStrategy) as any));
      },
      meta: undefined as any,
    };
  };
};
