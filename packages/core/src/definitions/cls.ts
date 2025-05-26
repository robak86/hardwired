import type { ConstructorArgsTokens } from '../configuration/dsl/new/shared/AddDefinitionBuilder.js';

import { LifeTime } from './abstract/LifeTime.js';
import type { ClassType } from './utils/class-type.js';
import { ClassDefinition } from './impl/ClassDefinition.js';

export const createClassDefinition =
  <TLifeTime extends LifeTime>(lifeTime: TLifeTime) =>
  <TInstance, TConstructorArgs extends any[]>(
    klass: ClassType<TInstance, TConstructorArgs>,
    ...dependencies: ConstructorArgsTokens<TConstructorArgs, TLifeTime>
  ): ClassDefinition<TInstance, TLifeTime, TConstructorArgs> => {
    return new ClassDefinition(Symbol(klass.name), lifeTime, klass, dependencies);
  };

export const cls = {
  singleton: createClassDefinition(LifeTime.singleton),
  transient: createClassDefinition(LifeTime.transient),
  scoped: createClassDefinition(LifeTime.scoped),
  cascading: createClassDefinition(LifeTime.cascading),
};
