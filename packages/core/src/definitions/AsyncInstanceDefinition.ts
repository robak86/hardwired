import { AnyInstanceDefinition } from './AnyInstanceDefinition';
import { ClassType } from '../utils/ClassType';
import { InstanceAsyncBuildFn } from './InstanceDefinition';
import { v4 } from 'uuid';

export type AsyncInstanceDefinition<T, TExternal> = {
  id: string;
  strategy: symbol;
  isAsync: true;
  create: (build: InstanceAsyncBuildFn) => Promise<T> | T;
  meta: any;
};

export const buildAsyncClassDefinition = <T, TDeps extends any[]>(
  klass: ClassType<T, TDeps>,
  strategy: symbol,
  dependencies: { [K in keyof TDeps]: AnyInstanceDefinition<TDeps[K]> },
): AsyncInstanceDefinition<T, any> => {
  return {
    id: v4(),
    strategy,
    isAsync: true,
    create: async build => {
      const dependenciesInstance = await Promise.all(dependencies.map(build));
      return new klass(...(dependenciesInstance as any));
    },
    meta: undefined,
  };
};

export const buildAsyncFunctionDefinition = <T, TDeps extends any[]>(
  factory: (...args: TDeps) => Promise<T>,
  strategy: symbol,
  dependencies: { [K in keyof TDeps]: AnyInstanceDefinition<TDeps[K]> },
): AsyncInstanceDefinition<T, any> => {
  return {
    id: `${factory.name}:${v4()}`,
    strategy,
    isAsync: true,
    create: async build => {
      const dependenciesInstance = await Promise.all(dependencies.map(build));
      return factory(...(dependenciesInstance as any));
    },

    meta: undefined,
  };
};

export const buildAsyncPartiallyAppliedFnDefinition = <TMeta>(
  strategy: symbol,
  fn,
  dependencies,
  meta: TMeta,
): AsyncInstanceDefinition<any, never> => {
  return {
    id: v4(),
    strategy,
    isAsync: true,
    create: async build => {
      if (fn.length === 0) {
        return fn;
      } else {
        const dependenciesInstance = await Promise.all(dependencies.map(build));
        return fn.bind(null, ...dependenciesInstance);
      }
    },
    meta: meta as any,
  };
};
