import { ContainerContext } from '../context/ContainerContext';
import invariant from 'tiny-invariant';
import { Thunk, unwrapThunk } from '../utils/Thunk';
import { InstanceDefinition } from '../new/InstanceDefinition';

// prettier-ignore
type MaterializeDependenciesRecordAsync<TDependencies extends Record<string, any>> = {
  [K in keyof TDependencies]: TDependencies[K] extends (ctx: ContainerContext) => infer TReturn
    ? TReturn extends Promise<infer TUnboxedPromise> ? TUnboxedPromise : TReturn
    : unknown;
};

export type DependencySelector<TReturn> = (context: ContainerContext) => TReturn;

const select = <T>(module: Thunk<InstanceDefinition<T>>) => {
  invariant(
    module !== undefined,
    `Provided module is undefined. It's probably because of circular modules references. Use thunk instead`,
  );
  return (context: ContainerContext): T => {
    return context.get(unwrapThunk(module));
  };
};

type MaterializedInstancesRecord<TDependencies extends Record<string, Thunk<InstanceDefinition<any>>>> = {
  [K in keyof TDependencies]: TDependencies[K] extends Thunk<InstanceDefinition<infer TInstance>> ? TInstance : unknown;
};

const record = <TDependencies extends Record<string, Thunk<InstanceDefinition<any>>>>(
  deps: TDependencies,
): ((ctx: ContainerContext) => MaterializedInstancesRecord<TDependencies>) => {
  return ctx => {
    const instances = {} as any;
    Object.keys(deps).forEach(key => {
      Object.defineProperty(instances, key, {
        configurable: false,
        enumerable: true,
        get: () => {
          return select(deps[key])(ctx);
        },
      });
    });
    return instances;
  };
};

const asyncRecord = <TDependencies extends Record<string, InstanceDefinition<any>>>(
  deps: TDependencies,
): ((ctx: ContainerContext) => Promise<MaterializeDependenciesRecordAsync<TDependencies>>) => {
  return async ctx => {
    const instances = {} as any;

    const unwrapped = await Promise.all(
      Object.values(deps).map(dep => {
        return select(dep)(ctx);
      }),
    );

    Object.keys(deps).forEach((key, idx) => {
      instances[key as keyof TDependencies] = unwrapped[idx];
    });

    return instances;
  };
};

export const inject = {
  select,
  record,
  asyncRecord,
};
