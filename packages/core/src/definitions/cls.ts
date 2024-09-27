import { InstancesDefinitions } from './abstract/sync/InstanceDefinition.js';
import { fn } from './definitions.js';
import { LifeTime } from './abstract/LifeTime.js';
import { Definition } from './abstract/Definition.js';

export type ClassType<TInstance, TConstructorArgs extends any[]> = {
  new (...args: TConstructorArgs): TInstance;
};

export const cls = {
  transient: <TInstance, TConstructorArgs extends any[]>(
    klass: ClassType<TInstance, TConstructorArgs>,
    deps: InstancesDefinitions<TConstructorArgs>,
  ): Definition<TInstance, LifeTime.transient, []> => {
    return fn(use => {
      return new klass(...(deps.map(dep => use(dep)) as TConstructorArgs));
    });
  },
  scoped: <TInstance, TConstructorArgs extends any[]>(
    klass: ClassType<TInstance, TConstructorArgs>,
    deps: InstancesDefinitions<TConstructorArgs>,
  ): Definition<TInstance, LifeTime.scoped, []> => {
    return fn.scoped(use => {
      return new klass(...(deps.map(dep => use(dep)) as TConstructorArgs));
    });
  },
  singleton: <TInstance, TConstructorArgs extends any[]>(
    klass: ClassType<TInstance, TConstructorArgs>,
    deps: InstancesDefinitions<TConstructorArgs>,
  ): Definition<TInstance, LifeTime.singleton, []> => {
    return fn.singleton(use => {
      return new klass(...(deps.map(dep => use(dep)) as TConstructorArgs));
    });
  },
};
