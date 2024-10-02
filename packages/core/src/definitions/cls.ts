import { fn } from './definitions.js';
import { LifeTime } from './abstract/LifeTime.js';
import { AnyDefinition, Definition } from './abstract/Definition.js';
import { Thunk } from '../utils/Thunk.js';
import { InstancesDefinitions } from './abstract/sync/InstanceDefinition.js';

export type ClassType<TInstance, TConstructorArgs extends any[]> = {
  new (...args: TConstructorArgs): TInstance;
};

type IsNotEmpty<T extends any[]> = T extends [] ? false : true;

function assertValidDependencies(dependencies: AnyDefinition[]) {
  if (dependencies.some(dep => dep === undefined)) {
    throw new Error(
      'Some dependencies are undefined. Try wrapping them in a function. cls(this, () => [dependency1, dependency2])',
    );
  }
}

export const cls = {
  transient: <TInstance, TConstructorArgs extends any[]>(
    klass: ClassType<TInstance, TConstructorArgs>,
    ...[dependencies]: IsNotEmpty<TConstructorArgs> extends true ? [Thunk<InstancesDefinitions<TConstructorArgs>>] : []
  ): Definition<TInstance, LifeTime.transient, []> => {
    if (dependencies === undefined) {
      // @ts-ignore
      return fn(() => new klass());
    }

    if (Array.isArray(dependencies)) {
      assertValidDependencies(dependencies);

      return fn(use => {
        return new klass(...(dependencies.map(dep => use(dep)) as TConstructorArgs));
      });
    }

    return fn(transient => {
      return new klass(...(dependencies().map(dep => transient(dep)) as TConstructorArgs));
    });
  },
  scoped: <TInstance, TConstructorArgs extends any[]>(
    klass: ClassType<TInstance, TConstructorArgs>,
    ...[dependencies]: IsNotEmpty<TConstructorArgs> extends true ? [Thunk<InstancesDefinitions<TConstructorArgs>>] : []
  ): Definition<TInstance, LifeTime.scoped, []> => {
    if (dependencies === undefined) {
      // @ts-ignore
      return fn.scoped(() => new klass());
    }

    if (Array.isArray(dependencies)) {
      assertValidDependencies(dependencies);

      return fn.scoped(use => {
        return new klass(...(dependencies.map(dep => use(dep)) as TConstructorArgs));
      });
    }

    return fn.scoped(transient => {
      return new klass(...(dependencies().map(dep => transient(dep)) as TConstructorArgs));
    });
  },
  singleton: <TInstance, TConstructorArgs extends any[]>(
    klass: ClassType<TInstance, TConstructorArgs>,
    ...[dependencies]: IsNotEmpty<TConstructorArgs> extends true ? [Thunk<InstancesDefinitions<TConstructorArgs>>] : []
  ): Definition<TInstance, LifeTime.singleton, []> => {
    if (dependencies === undefined) {
      // @ts-ignore
      return fn.singleton(() => new klass());
    }

    if (Array.isArray(dependencies)) {
      assertValidDependencies(dependencies);

      return fn.singleton(use => {
        return new klass(...(dependencies.map(dep => use(dep)) as TConstructorArgs));
      });
    }

    return fn.singleton(transient => {
      return new klass(...(dependencies().map(dep => transient(dep)) as TConstructorArgs));
    });
  },
};
