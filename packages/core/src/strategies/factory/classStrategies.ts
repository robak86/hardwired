import { ClassType } from '../../utils/ClassType';
import { SingletonStrategy } from '../SingletonStrategy';
import { RequestStrategy } from '../RequestStrategy';
import { TransientStrategy } from '../TransientStrategy';
import { InstanceDefinition, } from '../abstract/InstanceDefinition';
import { ScopeStrategy } from '../ScopeStrategy';
import { classDefinition, ClassInstanceDefinition } from "../abstract/InstanceDefinition/ClassInstanceDefinition";

type ClassDefinitionBuildFn = {
  <TInstance>(factory: ClassType<TInstance, []>): ClassInstanceDefinition<TInstance>;
  <TInstance, TDeps extends any[], TArg>(
    cls: ClassType<TInstance, [TArg]>,
    args: [InstanceDefinition<TArg>],
  ): ClassInstanceDefinition<TInstance>;
  <TInstance, TDeps extends any[], TArg, TArgs extends [TArg, ...TArg[]]>(
    cls: ClassType<TInstance, TArgs>,
    args: { [K in keyof TArgs]: InstanceDefinition<TArgs[K]> },
  ): ClassInstanceDefinition<TInstance>;
};

export const classSingleton: ClassDefinitionBuildFn = (cls, dependencies?) => {
  return classDefinition(cls, SingletonStrategy.type, dependencies ?? []);
};

export const classRequest: ClassDefinitionBuildFn = (cls, dependencies?) => {
  return classDefinition(cls, RequestStrategy.type, dependencies ?? []);
};

export const classTransient: ClassDefinitionBuildFn = (cls, dependencies?) => {
  return classDefinition(cls, TransientStrategy.type, dependencies ?? []);
};

export const classScoped: ClassDefinitionBuildFn = (cls, dependencies?) => {
  return classDefinition(cls, ScopeStrategy.type, dependencies ?? []);
};

