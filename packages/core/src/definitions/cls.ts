import { LifeTime } from './abstract/LifeTime.js';
import { Definition } from './abstract/Definition.js';
import { Thunk } from '../utils/Thunk.js';
import { InstancesDefinitions } from './abstract/sync/InstanceDefinition.js';
import { ClassDefinition } from './abstract/ClassDefinition.js';

export type ClassType<TInstance, TConstructorArgs extends any[]> = {
  new (...args: TConstructorArgs): TInstance;
};

type IsNotEmpty<T extends any[]> = T extends [] ? false : true;

export const cls = {
  transient: <TInstance, TConstructorArgs extends any[]>(
    klass: ClassType<TInstance, TConstructorArgs>,
    ...[dependencies]: IsNotEmpty<TConstructorArgs> extends true
      ? [Thunk<InstancesDefinitions<TConstructorArgs, LifeTime.transient>>]
      : []
  ): Definition<TInstance, LifeTime.transient, []> => {
    return new ClassDefinition(Symbol(), LifeTime.transient, klass, dependencies);
  },
  scoped: <TInstance, TConstructorArgs extends any[]>(
    klass: ClassType<TInstance, TConstructorArgs>,
    ...[dependencies]: IsNotEmpty<TConstructorArgs> extends true
      ? [Thunk<InstancesDefinitions<TConstructorArgs, LifeTime.scoped>>]
      : []
  ): Definition<TInstance, LifeTime.scoped, []> => {
    return new ClassDefinition(Symbol(), LifeTime.scoped, klass, dependencies);
  },
  singleton: <TInstance, TConstructorArgs extends any[]>(
    klass: ClassType<TInstance, TConstructorArgs>,
    ...[dependencies]: IsNotEmpty<TConstructorArgs> extends true
      ? [Thunk<InstancesDefinitions<TConstructorArgs, LifeTime.singleton>>]
      : []
  ): Definition<TInstance, LifeTime.singleton, []> => {
    return new ClassDefinition(Symbol(), LifeTime.singleton, klass, dependencies);
  },
};
