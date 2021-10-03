// import { BaseModuleBuilder, Definition, MaterializedModuleEntries, ModuleRegistry, NotDuplicated } from '..';
// import { DefinitionsSet } from '../module/DefinitionsSet';
//
export const a =1
// type NextFunctionModuleBuilder<TKey extends string, TReturn, TRegistry extends ModuleRegistry> = NotDuplicated<
//     TKey,
//     TRegistry,
//     FunctionModuleBuilder<
//         {
//             [K in keyof (TRegistry & { [K in TKey]: Definition<TReturn> })]: (TRegistry &
//             { [K in TKey]: Definition<TReturn> })[K];
//         }
//         >
//     >;
//
// export class FunctionModuleBuilder<TRegistry extends ModuleRegistry> extends BaseModuleBuilder<ModuleRegistry> {
//     constructor(registry: DefinitionsSet<TRegistry>) {
//         super(registry);
//     }
//
//     define<TKey extends string, TResult>(
//         key: TKey,
//         fn: () => TResult,
//     ): NextFunctionModuleBuilder<TKey, () => TResult, TRegistry>;
//     define<TKey extends string, TDep1, TResult>(
//         key: TKey,
//         fn: (d1: TDep1) => TResult,
//     ): NextFunctionModuleBuilder<TKey, (d1: TDep1) => TResult, TRegistry>;
//     define<TKey extends string, TDep1, TResult>(
//         key: TKey,
//         fn: (d1: TDep1) => TResult,
//         depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1],
//     ): NextFunctionModuleBuilder<TKey, () => TResult, TRegistry>;
//     define<TKey extends string, TDep1, TDep2, TResult>(
//         key: TKey,
//         fn: (d1: TDep1, d2: TDep2) => TResult,
//     ): NextFunctionModuleBuilder<TKey, (d1: TDep1, d2: TDep2) => TResult, TRegistry>;
//     define<TKey extends string, TDep1, TDep2, TResult>(
//         key: TKey,
//         fn: (d1: TDep1, d2: TDep2) => TResult,
//         depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1],
//     ): NextFunctionModuleBuilder<TKey, (dep2: TDep2) => TResult, TRegistry>;
//     define<TKey extends string, TDep1, TDep2, TResult>(
//         key: TKey,
//         fn: (d1: TDep1, d2: TDep2) => TResult,
//         depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1, TDep2],
//     ): NextFunctionModuleBuilder<TKey, () => TResult, TRegistry>;
//     // 3 args
//     define<TKey extends string, TDep1, TDep2, TDep3, TResult>(
//         key: TKey,
//         fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
//     ): NextFunctionModuleBuilder<TKey, (d1: TDep1, d2: TDep2, d3: TDep3) => TResult, TRegistry>;
//     define<TKey extends string, TDep1, TDep2, TDep3, TResult>(
//         key: TKey,
//         fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
//         depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1],
//     ): NextFunctionModuleBuilder<TKey, (dep2: TDep2, dep3: TDep3) => TResult, TRegistry>;
//     define<TKey extends string, TDep1, TDep2, TDep3, TResult>(
//         key: TKey,
//         fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
//         depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1, TDep2],
//     ): NextFunctionModuleBuilder<TKey, (dep3: TDep3) => TResult, TRegistry>;
//     define<TKey extends string, TDep1, TDep2, TDep3, TResult>(
//         key: TKey,
//         fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
//         depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1, TDep2, TDep3],
//     ): NextFunctionModuleBuilder<TKey, () => TResult, TRegistry>;
//     define(key, fn, depSelect?): any {
//         // return this.define(key, new CurriedFunctionResolver(fn, depSelect)) as any;
//         throw new Error('');
//     }
// }
//
// export const fun = <TRegistry extends ModuleRegistry>(registry: DefinitionsSet<TRegistry>) =>
//     new FunctionModuleBuilder(registry);
