import { AnyInstanceDefinition } from './AnyInstanceDefinition';
import { ClassType } from '../utils/ClassType';
import { InstanceDefinition } from './InstanceDefinition';
import { v4 } from 'uuid';

// Some of the async definitions are almost the same as they sync counterpart, but they are introduced mostly for type-safety
// Sync definitions cannot have async dependencies
export type AsyncInstanceDefinition<T, TExternal> = {
  id: string;
  strategy: symbol;
  isAsync: true;
  dependencies: AnyInstanceDefinition<any>[];
  create: (dependencies: any[]) => Promise<T> | T;
  meta: any;
};

export const buildAsyncClassDefinition = <T, TDeps extends any[]>(
  klass: ClassType<T, TDeps>,
  strategy: symbol,
  dependencies: { [K in keyof TDeps]: InstanceDefinition<TDeps[K]> },
): AsyncInstanceDefinition<T, any> => {
  return {
    id: v4(),
    strategy,
    isAsync: true,
    create: (dependencies: any[]) => new klass(...(dependencies as any)),
    dependencies,
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
    create: (dependencies: TDeps[]) => factory(...(dependencies as any)),
    dependencies,
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
    create: (dependencies: any[]) => {
      if (fn.length === 0) {
        return fn;
      } else {
        return fn.bind(null, ...dependencies);
      }
    },
    dependencies,
    meta: meta as any,
  };
};
