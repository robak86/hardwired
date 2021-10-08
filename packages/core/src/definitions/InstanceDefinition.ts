import { AnyInstanceDefinition } from './AnyInstanceDefinition';
import { AsyncInstanceDefinition } from './AsyncInstanceDefinition';
import { ClassType } from '../utils/ClassType';
import { v4 } from 'uuid';
import { TransientStrategy } from '../strategies/sync/TransientStrategy';

export type InstanceDefinition<TInstance, TExternal = any> = {
  id: string;
  strategy: symbol;
  create: (buildFn: InstanceBuildFn) => TInstance;
  meta: any; // we don't need to implement meta here - just relax types on .get .getAll to accept subtypes of InstanceDefinition
};

export type InstanceBuildFn = {
  (definition: InstanceDefinition<any>): any;
};

export type InstanceAsyncBuildFn = {
  (definition: AnyInstanceDefinition<any>): Promise<any>;
};

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
      return new klass(...(dependencies.map(build) as any));
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
