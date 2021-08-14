import { Module } from '../module/Module';
import { ContainerContext } from '../context/ContainerContext';

type MaterializeDependenciesTuple<TDependencies extends [...Array<(ctx: ContainerContext) => any>]> = {
  [K in keyof TDependencies]: TDependencies[K] extends (ctx: ContainerContext) => infer TReturn ? TReturn : unknown;
};

type MaterializeDependenciesRecord<TDependencies extends Record<string, any>> = {
  [K in keyof TDependencies]: TDependencies[K] extends (ctx: ContainerContext) => infer TReturn ? TReturn : unknown;
};

// prettier-ignore
type MaterializeDependenciesRecordAsync<TDependencies extends Record<string, any>> = {
  [K in keyof TDependencies]: TDependencies[K] extends (ctx: ContainerContext) => infer TReturn
    ? TReturn extends Promise<infer TUnboxedPromise> ? TUnboxedPromise : TReturn
    : unknown;
};

const select = <TModule extends Module<any>, TKey extends Module.InstancesKeys<TModule>>(
  module: TModule,
  name: TKey,
) => {
  return (context: ContainerContext): Module.Materialized<TModule>[TKey] => {
    return context.get(module, name);
  };
};

const record = <TDependencies extends Record<string, (ctx: ContainerContext) => any>>(
  deps: TDependencies,
): ((ctx: ContainerContext) => MaterializeDependenciesRecord<TDependencies>) => {
  return ctx => {
    const instances = {} as any;
    Object.keys(deps).forEach(key => {
      Object.defineProperty(instances, key, {
        configurable: false,
        enumerable: true,
        get: () => {
          return deps[key](ctx);
        },
      });
    });
    return instances;
  };
};

const asyncRecord = <TDependencies extends Record<string, (ctx: ContainerContext) => any>>(
  deps: TDependencies,
): ((ctx: ContainerContext) => Promise<MaterializeDependenciesRecordAsync<TDependencies>>) => {
  return async ctx => {
    const instances = {} as any;

    const unwrapped = await Promise.all(
      Object.values(deps).map(dep => {
        return dep(ctx);
      }),
    );

    Object.keys(deps).forEach((key, idx) => {
      instances[key as keyof TDependencies] = unwrapped[idx];
    });

    return instances;
  };
};

const tuple = <
  TDependencyEntry extends (ctx: ContainerContext) => any,
  TDependencies extends [TDependencyEntry, ...TDependencyEntry[]],
>(
  ...deps: TDependencies
) => {
  return (ctx: ContainerContext): MaterializeDependenciesTuple<TDependencies> => {
    return deps.map(d => d(ctx)) as any;
  };
};

export const inject = {
  select,
  record,
  tuple,
  asyncRecord,
};
