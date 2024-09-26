import { InstancesDefinitions } from './abstract/sync/InstanceDefinition.js';
import { fn } from './definitions.js';
import { BaseDefinition } from './abstract/FnDefinition.js';
import { LifeTime } from './abstract/LifeTime.js';

export type ClassType<TInstance, TConstructorArgs extends any[]> = {
  new (...args: TConstructorArgs): TInstance;
};

export const cls = {
  transient: <TInstance, TConstructorArgs extends any[]>(
    klass: ClassType<TInstance, TConstructorArgs>,
    deps: InstancesDefinitions<TConstructorArgs>,
  ): BaseDefinition<TInstance, LifeTime.transient, any, []> => {
    return fn(use => {
      return new klass(...(deps.map(dep => use(dep)) as TConstructorArgs));
    });
  },
  scoped: <TInstance, TConstructorArgs extends any[]>(
    klass: ClassType<TInstance, TConstructorArgs>,
    deps: InstancesDefinitions<TConstructorArgs>,
  ): BaseDefinition<TInstance, LifeTime.scoped, any, []> => {
    return fn.scoped(use => {
      return new klass(...(deps.map(dep => use(dep)) as TConstructorArgs));
    });
  },
  singleton: <TInstance, TConstructorArgs extends any[]>(
    klass: ClassType<TInstance, TConstructorArgs>,
    deps: InstancesDefinitions<TConstructorArgs>,
  ): BaseDefinition<TInstance, LifeTime.singleton, any, []> => {
    return fn.singleton(use => {
      return new klass(...(deps.map(dep => use(dep)) as TConstructorArgs));
    });
  },
};
