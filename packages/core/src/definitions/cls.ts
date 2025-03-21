import type { Thunk, UnwrapThunk } from '../utils/Thunk.js';
import type { HasPromise } from '../container/IContainer.js';

import { LifeTime } from './abstract/LifeTime.js';
import type { Definition } from './impl/Definition.js';
import { ClassDefinition } from './impl/ClassDefinition.js';
import type { ValidDependenciesLifeTime } from './abstract/InstanceDefinitionDependency.js';
import type { InstancesArray } from './abstract/InstanceDefinition.js';

export type ClassType<TInstance, TConstructorArgs extends any[]> = new (...args: TConstructorArgs) => TInstance;

type IsNotEmpty<T extends any[]> = T extends [] ? false : true;

// prettier-ignore
type WrapAsync<TDependenciesDefinitions, TInstance> =
  UnwrapThunk<TDependenciesDefinitions> extends any[] ?
    HasPromise<InstancesArray<UnwrapThunk<TDependenciesDefinitions>>> extends true ? Promise<TInstance> : TInstance :
    never;

export type ConstructorArgsDefinitions<T extends any[], TCurrentLifeTime extends LifeTime> = {
  [K in keyof T]: Definition<T[K] | Promise<T[K]>, ValidDependenciesLifeTime<TCurrentLifeTime>, any>;
};

export type Callable<TInstance, TArgs extends any[]> = {
  call(...args: TArgs): TInstance;
};

export const cls = {
  transient: <
    TInstance,
    TConstructorArgs extends any[],
    TDependencies extends Thunk<ConstructorArgsDefinitions<TConstructorArgs, LifeTime.transient>>,
  >(
    klass: ClassType<TInstance, TConstructorArgs>,
    ...[dependencies]: IsNotEmpty<TConstructorArgs> extends true ? [TDependencies] : []
  ): Definition<WrapAsync<TDependencies, TInstance>, LifeTime.transient, []> => {
    return new ClassDefinition(Symbol(), LifeTime.transient, klass, dependencies) as Definition<
      WrapAsync<TDependencies, TInstance>,
      LifeTime.transient,
      []
    >;
  },
  scoped: <
    TInstance,
    TConstructorArgs extends any[],
    TDependencies extends Thunk<ConstructorArgsDefinitions<TConstructorArgs, LifeTime.scoped>>,
  >(
    klass: ClassType<TInstance, TConstructorArgs>,
    ...[dependencies]: IsNotEmpty<TConstructorArgs> extends true ? [TDependencies] : []
  ): Definition<WrapAsync<TDependencies, TInstance>, LifeTime.scoped, []> => {
    return new ClassDefinition(Symbol(), LifeTime.scoped, klass, dependencies) as Definition<
      WrapAsync<TDependencies, TInstance>,
      LifeTime.scoped,
      []
    >;
  },
  singleton: <
    TInstance,
    TConstructorArgs extends any[],
    TDependencies extends Thunk<ConstructorArgsDefinitions<TConstructorArgs, LifeTime.singleton>>,
  >(
    klass: ClassType<TInstance, TConstructorArgs>,
    ...[dependencies]: IsNotEmpty<TConstructorArgs> extends true ? [TDependencies] : []
  ): Definition<WrapAsync<TDependencies, TInstance>, LifeTime.singleton, []> => {
    return new ClassDefinition(Symbol(), LifeTime.singleton, klass, dependencies) as Definition<
      WrapAsync<TDependencies, TInstance>,
      LifeTime.singleton,
      []
    >;
  },
};
