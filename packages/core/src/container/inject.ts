import { Module } from '../resolvers/abstract/Module';
import { ContainerContext } from './ContainerContext';
import { ContextService } from './ContextService';

type MaterializeDependenciesTuple<TDependencies extends [...Array<(ctx: ContainerContext) => any>]> = {
  [K in keyof TDependencies]: TDependencies[K] extends (ctx: ContainerContext) => infer TReturn ? TReturn : unknown;
};

type MaterializeDependenciesRecord<TDependencies extends Record<string, any>> = {
  [K in keyof TDependencies]: TDependencies[K] extends (ctx: ContainerContext) => infer TReturn ? TReturn : unknown;
};

const select = <TModule extends Module<any>, TKey extends Module.InstancesKeys<TModule>>(
  module: TModule,
  name: TKey,
) => {
  return (context: ContainerContext): Module.Materialized<TModule>[TKey] => {
    return ContextService.get(module, name, context);
  };
};

const record = <TDependencies extends Record<string, (ctx: ContainerContext) => any>>(
  deps: TDependencies,
): ((ctx: ContainerContext) => MaterializeDependenciesRecord<TDependencies>) => {
  return ctx => {
    const instances = {} as any;
    Object.keys(deps).forEach(key => {
      instances[key as keyof TDependencies] = deps[key](ctx);
    });
    return instances;
  };
};

const tuple = <
  TDependencyEntry extends (ctx: ContainerContext) => any,
  TDependencies extends [TDependencyEntry, ...TDependencyEntry[]]
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
};
