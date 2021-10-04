import { ClassType } from '../../utils/ClassType';
import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { buildClassDefinition, ClassDefinition } from '../abstract/InstanceDefinition/BuildClassDefinition';

type ClassDefinitionBuildFn = {
  <TInstance, TDeps extends any[], TArgs extends any[]>(
    cls: ClassType<TInstance, TArgs>,
    ...args: { [K in keyof TArgs]: InstanceDefinition<TArgs[K]> }
  ): ClassDefinition<TInstance>;
};

export const classDefinition = (strategy: symbol): ClassDefinitionBuildFn => {
  return (cls, ...dependencies) => {
    return buildClassDefinition(cls, strategy, dependencies);
  };
};

type ClassDefinitionWithMetaBuildFn<TMeta> = {
  <TInstance, TDeps extends any[], TArgs extends any[]>(
    meta: TMeta,
    cls: ClassType<TInstance, TArgs>,
    ...args: { [K in keyof TArgs]: InstanceDefinition<TArgs[K]> }
  ): ClassDefinition<TInstance>;
};

export const classDefinitionWithMeta = <TMeta>(
  strategy: symbol,
  defaults?: Partial<TMeta>,
): ClassDefinitionWithMetaBuildFn<TMeta> => {
  return (meta, cls, ...dependencies) => {
    return buildClassDefinition(cls, strategy, dependencies);
  };
};
