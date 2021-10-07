import { AnyInstanceDefinition } from './AnyInstanceDefinition';
import { AsyncInstanceDefinition } from './AsyncInstanceDefinition';
import { ClassType } from '../utils/ClassType';
import { v4 } from 'uuid';

export type InstanceDefinition<TInstance, TExternal = any> = {
  id: string;
  strategy: symbol;
  // dependencies: InstanceDefinition<any>[]; // TODO: having array of dependencies we can easily check for circular references
  create: (buildFn: InstanceBuildFn) => TInstance;
  meta: any;
};

export type InstanceBuildFn = {
  (definition: InstanceDefinition<any>): any;
};

type InstanceDef2 = () => {
  id: string;
  strategy: symbol;
  create: (buildFn: (id: string, strategy: symbol) => any) => {};
};

const azz = {
  id: 'sdf', // cannot be replaced by weakmap because set|replace would need somehow inherit identity of original definition
  strategy: 'am',
  create: (buildFn: (id: string, strategy: symbol) => any) => {
    console.log(azz.id);
  },
};

type Instantiable<T> = {
  id: string;
  strategy: symbol;
  create: (buildFn: InstanceBuildFn) => T;
};

type EphemeralInstantiable<T> = (buildFn: InstanceBuildFn) => T; // has no id (no caching, no patching) and uses always transient stratety

// export type InstancesComposition<TShape extends Record<keyof any, any>> = {
//   instances: { [K in keyof TShape]: InstanceDefinition<TShape[K]> };
// };

export const instanceDefinition = {
  isAsync(val: AnyInstanceDefinition<any, any>): val is AsyncInstanceDefinition<any, any> {
    return (val as any).isAsync;
  },
  isSync(val: AnyInstanceDefinition<any, any>): val is InstanceDefinition<any, any> {
    return !(val as any).isAsync;
  },
};

export const buildClassDefinition = <T, TDeps extends any[], TMeta>(
  klass: ClassType<T, TDeps>,
  strategy: symbol,
  dependencies: { [K in keyof TDeps]: InstanceDefinition<TDeps[K], TMeta> },
  meta?: TMeta,
): InstanceDefinition<T, TMeta> => {
  return {
    id: v4(),
    strategy,
    create: build => {
      return new klass(...dependencies.map(build) as any);
    },
    meta: meta as any,
  };
};

export const functionDefinition = <T, TDeps extends any[]>(
  factory: (...args: TDeps) => T,
  strategy: symbol,
  dependencies: { [K in keyof TDeps]: InstanceDefinition<TDeps[K]> },
): InstanceDefinition<T> => {
  return {
    id: `${factory.name}:${v4()}`,
    strategy,
    create: build => {
      return factory(...(dependencies.map(build) as any));

      // return factory(...(dependencies as any));
    },
    // dependencies,
    meta: undefined,
  };
};

export const partiallyAppliedFnDefinition = <TMeta>(
  strategy: symbol,
  fn,
  dependencies,
  meta: TMeta,
): InstanceDefinition<any, any> => {
  return {
    id: v4(),
    strategy,

    create: build => {
      if (fn.length === 0) {
        return fn;
      } else {
        return fn.bind(null, ...dependencies.map(build));
      }
    },

    meta: meta as any,
  };
};
