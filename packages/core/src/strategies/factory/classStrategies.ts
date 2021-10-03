import { ClassType } from '../../utils/ClassType';
import { SingletonStrategy } from '../SingletonStrategy';
import { RequestStrategy } from '../RequestStrategy';
import { TransientStrategy } from '../TransientStrategy';
import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { ScopeStrategy } from '../ScopeStrategy';
import { classDefinition, ClassDefinition } from '../abstract/InstanceDefinition/ClassDefinition';

type ClassDefinitionBuildFn = {
  <TInstance, TDeps extends any[], TArgs extends any[]>(
    cls: ClassType<TInstance, TArgs>,
    ...args: { [K in keyof TArgs]: InstanceDefinition<TArgs[K]> }
  ): ClassDefinition<TInstance>;
};

export const classSingleton: ClassDefinitionBuildFn = (cls, ...dependencies) => {
  return classDefinition(cls, SingletonStrategy.type, dependencies);
};

export const classRequest: ClassDefinitionBuildFn = (cls, ...dependencies) => {
  return classDefinition(cls, RequestStrategy.type, dependencies);
};

export const classTransient: ClassDefinitionBuildFn = (cls, ...dependencies) => {
  return classDefinition(cls, TransientStrategy.type, dependencies);
};

export const classScoped: ClassDefinitionBuildFn = (cls, ...dependencies) => {
  return classDefinition(cls, ScopeStrategy.type, dependencies);
};
