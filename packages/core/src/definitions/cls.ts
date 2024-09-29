import { fn } from './definitions.js';
import { LifeTime } from './abstract/LifeTime.js';
import { Definition } from './abstract/Definition.js';
import { Thunk, unwrapThunk } from '../utils/Thunk.js';
import { InstancesDefinitions } from './abstract/sync/InstanceDefinition.js';

export type ClassType<TInstance, TConstructorArgs extends any[]> = {
  new (...args: TConstructorArgs): TInstance;
};

type IsNotEmpty<T extends any[]> = T extends [] ? false : true;

export const cls = {
  transient: <TInstance, TConstructorArgs extends any[]>(
    klass: ClassType<TInstance, TConstructorArgs>,
    ...deps: IsNotEmpty<TConstructorArgs> extends true ? [Thunk<InstancesDefinitions<TConstructorArgs>>] : []
  ): Definition<TInstance, LifeTime.transient, []> => {
    const unwrappedDeps = unwrapThunk(deps[0] ?? []);

    return fn(use => {
      return new klass(...(unwrappedDeps.map(dep => use(dep)) as TConstructorArgs));
    });
  },
  scoped: <TInstance, TConstructorArgs extends any[]>(
    klass: ClassType<TInstance, TConstructorArgs>,
    ...deps: IsNotEmpty<TConstructorArgs> extends true ? [Thunk<InstancesDefinitions<TConstructorArgs>>] : []
  ): Definition<TInstance, LifeTime.scoped, []> => {
    const unwrappedDeps = unwrapThunk(deps[0] ?? []);

    return fn.scoped(use => {
      return new klass(...(unwrappedDeps.map(dep => use(dep)) as TConstructorArgs));
    });
  },
  singleton: <TInstance, TConstructorArgs extends any[]>(
    klass: ClassType<TInstance, TConstructorArgs>,
    ...deps: IsNotEmpty<TConstructorArgs> extends true ? [Thunk<InstancesDefinitions<TConstructorArgs>>] : []
  ): Definition<TInstance, LifeTime.singleton, []> => {
    const unwrappedDeps = unwrapThunk(deps[0] ?? []);

    return fn.singleton(use => {
      return new klass(...(unwrappedDeps.map(dep => use(dep)) as TConstructorArgs));
    });
  },
};
