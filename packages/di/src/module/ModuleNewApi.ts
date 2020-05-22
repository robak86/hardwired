import { Definition, MaterializedModuleEntries, ModuleRegistry } from './ModuleRegistry';
import { DependencyResolver } from '..';

type Define<TRegistry extends ModuleRegistry> = (
  registry: TRegistry,
) => (...args: any[]) => DependencyResolver<TRegistry, any>;

type DependencyResolverReturn<T extends DependencyResolver<any, any>> = T extends DependencyResolver<any, infer TReturn>
  ? TReturn
  : never;

export class ModuleNewApi<TRegistry extends ModuleRegistry> {
  define<TKey extends string, TDefiner extends Define<TRegistry>, TArgs extends Parameters<ReturnType<TDefiner>>>(
    key: TKey,
    definer: TDefiner,
    ...args: TArgs
  ): ModuleNewApi<TRegistry & { [K in TKey]: Definition<DependencyResolverReturn<ReturnType<ReturnType<TDefiner>>>> }> {
    // ): TArgs {
    throw new Error('Implement me');
  }

  define2<TKey extends string, TResolver extends DependencyResolver<TRegistry, any>>(
    key: TKey,
    definer: (registry: TRegistry) => TResolver,
  ): ModuleNewApi<TRegistry & { [K in TKey]: Definition<DependencyResolverReturn<TResolver>> }> {
    throw new Error('Implement me');
  }
}

const singleton2 = <TRegistry extends ModuleRegistry, TValue>(
  fac: (container: MaterializedModuleEntries<TRegistry>) => TValue,
) => (registry: TRegistry): DependencyResolver<any, TValue> => {
  return 123 as any;
};

type CurriedFn = {
  <TRegistry extends ModuleRegistry, TResult>(fn: () => TResult): (
    registry: TRegistry,
  ) => DependencyResolver<any, () => TResult>;
  <TRegistry extends ModuleRegistry, TDep1, TResult>(fn: (d1: TDep1) => TResult): (
    registry: TRegistry,
  ) => DependencyResolver<any, (d1: TDep1) => TResult>;
  <TRegistry extends ModuleRegistry, TDep1, TResult>(
    fn: (d1: TDep1) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1],
  ): (registry: TRegistry) => DependencyResolver<any, () => TResult>;
  <TRegistry extends ModuleRegistry, TDep1, TDep2, TResult>(fn: (d1: TDep1, d2: TDep2) => TResult): (
    registry: TRegistry,
  ) => DependencyResolver<any, (d1: TDep1, d2: TDep2) => TResult>;
  <TRegistry extends ModuleRegistry, TDep1, TDep2, TResult>(
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1],
  ): (registry: TRegistry) => DependencyResolver<any, (dep2: TDep2) => TResult>;
  <TRegistry extends ModuleRegistry, TDep1, TDep2, TResult>(
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1, TDep2],
  ): (registry: TRegistry) => DependencyResolver<any, () => TResult>;
  // 3 args
  <TRegistry extends ModuleRegistry, TDep1, TDep2, TDep3, TResult>(fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult): (
    registry: TRegistry,
  ) => DependencyResolver<any, (d1: TDep1, d2: TDep2, d3: TDep3) => TResult>;
  <TRegistry extends ModuleRegistry, TDep1, TDep2, TDep3, TResult>(
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1],
  ): (registry: TRegistry) => DependencyResolver<any, (dep2: TDep2, dep3: TDep3) => TResult>;
  <TRegistry extends ModuleRegistry, TDep1, TDep2, TDep3, TResult>(
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1, TDep2],
  ): (registry: TRegistry) => DependencyResolver<any, (dep3: TDep3) => TResult>;
  <TRegistry extends ModuleRegistry, TDep1, TDep2, TDep3, TResult>(
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1, TDep2, TDep3],
  ): (registry: TRegistry) => DependencyResolver<any, () => TResult>;
};

const curry: CurriedFn = null as any;

const someFunction = (a: number, b: string) => 123;

const mod = new ModuleNewApi<{}>();

const singleton = <TRegistry extends ModuleRegistry, TFunc extends (...args:any[]) => any>(registry: TRegistry) => (
  fac: TFunc,
): DependencyResolver<any, ReturnType<TFunc>> => {
  return 123 as any;
};

const m2 = mod
  // .define2(
  //   'def1',
  //   singleton2(ctx => 'sdf'),
  // )
  // .define2(
  //   'def3',
  //   curry(someFunction, ctx => [1, ctx.def1]),
  // )
  // .define2(
  //   'def2',
  //   singleton2(ctx => ctx.def1),
  // );
  // .define2('def2', singleton2(ctx => ctx.def1))
  .define('def3', singleton, ctx => 1);
// .define('def2', singleton, ctx => ctx.def1);