import { ClassType } from '../../utils/ClassType';
import { AnyInstanceDefinition } from '../abstract/AnyInstanceDefinition';
import {
  AsyncClassDefinition,
  buildAsyncClassDefinition,
} from '../abstract/AsyncInstanceDefinition/AsyncClassDefinition';

type ClassDefinitionBuildFn = {
  <TInstance, TDeps extends any[], TArgs extends any[]>(
    cls: ClassType<TInstance, TArgs>,
    ...args: { [K in keyof TArgs]: AnyInstanceDefinition<TArgs[K]> }
  ): AsyncClassDefinition<TInstance>;
};

export const asyncClassDefinition = (strategy: symbol): ClassDefinitionBuildFn => {
  return (cls, ...dependencies) => {
    return buildAsyncClassDefinition(cls, strategy, dependencies as any);
  };
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
