import type { Thunk, UnwrapThunk } from '../utils/Thunk.js';
import type { HasPromise } from '../container/IContainer.js';

import { LifeTime } from './abstract/LifeTime.js';
import type { ClassType } from './utils/class-type.js';
import { ClassDefinition } from './impl/ClassDefinition.js';
import type { InstancesArray } from './abstract/InstanceDefinition.js';
import type { ValidDependenciesLifeTime } from './abstract/InstanceDefinitionDependency.js';
import type { IDefinition } from './abstract/IDefinition.js';
import type { IDefinitionToken } from './DefinitionToken.js';

export type WrapAsync<TInstance, TDependenciesDefinitions> =
  UnwrapThunk<TDependenciesDefinitions> extends any[]
    ? HasPromise<InstancesArray<UnwrapThunk<TDependenciesDefinitions>>> extends true
      ? Promise<TInstance>
      : TInstance
    : never;

export type ConstructorArgsTokens<T extends any[], TCurrentLifeTime extends LifeTime> = {
  [K in keyof T]: IDefinitionToken<T[K] | Promise<T[K]>, ValidDependenciesLifeTime<TCurrentLifeTime>>;
};

type IsNotEmpty<T extends any[]> = T extends [] ? false : true;

const transient = <
  TInstance,
  TConstructorArgs extends any[],
  TDependencies extends Thunk<ConstructorArgsTokens<TConstructorArgs, LifeTime.transient>>,
>(
  klass: ClassType<TInstance, TConstructorArgs>,
  ...[dependencies]: IsNotEmpty<TConstructorArgs> extends true ? [TDependencies] : []
): IDefinition<WrapAsync<TInstance, TDependencies>, LifeTime.transient> => {
  return new ClassDefinition<WrapAsync<TInstance, TDependencies>, LifeTime.transient, TConstructorArgs>(
    Symbol(),
    LifeTime.transient,
    klass as any,
    (dependencies ?? []) as TDependencies,
  );
};

const scoped = <
  TInstance,
  TConstructorArgs extends any[],
  TDependencies extends Thunk<ConstructorArgsTokens<TConstructorArgs, LifeTime.scoped>>,
>(
  klass: ClassType<TInstance, TConstructorArgs>,
  ...[dependencies]: IsNotEmpty<TConstructorArgs> extends true ? [TDependencies] : []
): IDefinition<WrapAsync<TInstance, TDependencies>, LifeTime.scoped> => {
  return new ClassDefinition<WrapAsync<TInstance, TDependencies>, LifeTime.scoped, TConstructorArgs>(
    Symbol(),
    LifeTime.scoped,
    klass as any,
    (dependencies ?? []) as TDependencies,
  );
};

const cascading = <
  TInstance,
  TConstructorArgs extends any[],
  TDependencies extends Thunk<ConstructorArgsTokens<TConstructorArgs, LifeTime.cascading>>,
>(
  klass: ClassType<TInstance, TConstructorArgs>,
  ...[dependencies]: IsNotEmpty<TConstructorArgs> extends true ? [TDependencies] : []
): IDefinition<WrapAsync<TInstance, TDependencies>, LifeTime.cascading> => {
  return new ClassDefinition<WrapAsync<TInstance, TDependencies>, LifeTime.cascading, TConstructorArgs>(
    Symbol(),
    LifeTime.cascading,
    klass as any,
    (dependencies ?? []) as TDependencies,
  );
};

const singleton = <
  TInstance,
  TConstructorArgs extends any[],
  TDependencies extends Thunk<ConstructorArgsTokens<TConstructorArgs, LifeTime.singleton>>,
>(
  klass: ClassType<TInstance, TConstructorArgs>,
  ...[dependencies]: IsNotEmpty<TConstructorArgs> extends true ? [TDependencies] : []
): IDefinition<WrapAsync<TInstance, TDependencies>, LifeTime.singleton> => {
  return new ClassDefinition<WrapAsync<TInstance, TDependencies>, LifeTime.singleton, TConstructorArgs>(
    Symbol(),
    LifeTime.singleton,
    klass as any,
    (dependencies ?? []) as TDependencies,
  );
};

export const cls = {
  singleton,
  transient,
  scoped,
  cascading,
};
