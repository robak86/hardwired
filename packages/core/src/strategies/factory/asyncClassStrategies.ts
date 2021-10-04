import { ClassType } from '../../utils/ClassType';
import { AnyInstanceDefinition } from '../abstract/AnyInstanceDefinition';
import { AsyncClassDefinition, asyncClassDefinition } from '../abstract/AsyncInstanceDefinition/AsyncClassDefinition';
import { AsyncSingletonStrategy } from "../AsyncSingletonStrategy";

type ClassDefinitionBuildFn = {
  <TInstance, TDeps extends any[], TArgs extends any[]>(
    cls: ClassType<TInstance, TArgs>,
    ...args: { [K in keyof TArgs]: AnyInstanceDefinition<TArgs[K]> }
  ): AsyncClassDefinition<TInstance>;
};

export const asyncClassSingleton: ClassDefinitionBuildFn = (cls, ...dependencies) => {
  return asyncClassDefinition(cls, AsyncSingletonStrategy.type, dependencies as any);
};
//
// export const classRequest: ClassDefinitionBuildFn = (cls, dependencies?) => {
//   return classDefinition(cls, RequestStrategy.type, dependencies ?? []);
// };
//
// export const classTransient: ClassDefinitionBuildFn = (cls, dependencies?) => {
//   return classDefinition(cls, TransientStrategy.type, dependencies ?? []);
// };
//
// export const classScoped: ClassDefinitionBuildFn = (cls, dependencies?) => {
//   return classDefinition(cls, ScopeStrategy.type, dependencies ?? []);
// };
