import { AnyInstanceDefinition } from './AnyInstanceDefinition';
import { AsyncInstanceDefinition } from './AsyncInstanceDefinition';
import { ClassType } from '../utils/ClassType';
import { v4 } from 'uuid';

export type InstanceDefinition<TInstance, TExternal = any> = {
  id: string;
  strategy: symbol;
  dependencies: InstanceDefinition<any>[];
  create: (dependencies: any[]) => TInstance;
  meta: any;
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
    create: (dependencies: any[]) => new klass(...(dependencies as any)),
    dependencies,
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
    create: (dependencies: TDeps[]) => factory(...(dependencies as any)),
    dependencies,
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
