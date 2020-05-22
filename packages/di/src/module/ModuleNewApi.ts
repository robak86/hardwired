import { Definition, MaterializedModuleEntries, ModuleRegistry } from './ModuleRegistry';
import { DefinitionsSet, DependencyResolver, Module, module, singletonDefines } from '..';
import { DependencyResolverReturn } from '../resolvers/DependencyResolver';
import { curry } from '../builder-fp/curry';
import { singleton } from '../builder-fp/singleton';
import { fun } from '../builders/FunctionBuilder';

// type Define<TRegistry extends ModuleRegistry> = (
//   ...args: any[]
// ) => <TRegistry extends ModuleRegistry>(registry: TRegistry) => DependencyResolver<TRegistry, any>;

export class ModuleNewApi<TRegistry extends ModuleRegistry> {
  // define<TKey extends string, TDefiner extends Define<TRegistry>, TArgs extends Parameters<ReturnType<TDefiner>>>(
  //   key: TKey,
  //   definer: TDefiner,
  //   ...args: TArgs
  // ): ModuleNewApi<TRegistry & { [K in TKey]: Definition<DependencyResolverReturn<ReturnType<ReturnType<TDefiner>>>> }> {
  //   // ): TArgs {
  //   throw new Error('Implement me');
  // }

  define2<TKey extends string, TResolver extends DependencyResolver<TRegistry, any>>(
    key: TKey,
    definer: (registry: DefinitionsSet<TRegistry>) => TResolver,
  ): ModuleNewApi<TRegistry & { [K in TKey]: Definition<DependencyResolverReturn<TResolver>> }> {
    throw new Error('Implement me');
  }

  define22<TKey extends string, TResolver extends DependencyResolver<TRegistry, any>>(
    key: TKey,
    definer: TResolver,
  ): ModuleNewApi<TRegistry & { [K in TKey]: Definition<DependencyResolverReturn<TResolver>> }> {
    throw new Error('Implement me');
  }

  define3<
    TKey extends string,
    TDefiner extends (...args: any[]) => (registry: TRegistry) => DependencyResolver<TRegistry, any>
  >(
    key: TKey,
    definer: TDefiner,
    ...args: Parameters<TDefiner>
  ): ModuleNewApi<TRegistry & { [K in TKey]: Definition<DependencyResolverReturn<ReturnType<ReturnType<TDefiner>>>> }> {
    // ): TArgs {
    throw new Error('Implement me');
  }
}

// const curry: CurriedFn = null as any;

const someFunction = (a: number, b: string) => 123;

const mod = new ModuleNewApi<{}>();

// const singleton = <TRegistry extends ModuleRegistry, TFunc extends (...args: any[]) => any>(fac: TFunc) => (
//   registry: TRegistry,
// ): DependencyResolver<TRegistry, ReturnType<TFunc>> => {
//   return 123 as any;
// };

const singleton2 = <TRegistry extends ModuleRegistry, TValue>(
  fac: (container: MaterializedModuleEntries<TRegistry>) => TValue,
) => (registry: TRegistry): DependencyResolver<any, TValue> => {
  return 123 as any;
};

const singleton22 = <TRegistry extends ModuleRegistry, TValue>(
  fac: (container: MaterializedModuleEntries<TRegistry>) => TValue,
): DependencyResolver<TRegistry, TValue> => {
  return 123 as any;
};

// prettier-ignore
// const m = module('m1')
const m = new Module<{}>(null as any)
  // .using2([singletonDefines, fun])

// .define2('a', singleton(ctx => 'sdf'))
// .define2('b', singleton(ctx => ctx.a))

// .define2('c', curry(someFunction, ctx => [1, 'dsf']))
// .define22('z', singleton22(ctx => 1))
//
// const m2 = mod
//   .define2(
//     'def111',
//     singleton2(ctx => 'sdf'),
//   )
//   .define2(
//     'def1',
//     singleton2(ctx => ctx.def111),
//   )
//   .define3('def2', singleton, () => 1)
//   .define2(
//     'def3',
//     curry(someFunction, ctx => [1, ctx.def2]),
//   );
// .define2(
//   'def2',
//   singleton2(ctx => ctx.def1),
// );
// .define2('def2', singleton2(ctx => ctx.def1))
// .define('def3', singleton, ctx => 1);
// .define('def2', singleton, ctx => ctx.def1);
