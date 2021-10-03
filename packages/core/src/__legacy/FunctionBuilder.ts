// import { BaseModuleBuilder, Definition, MaterializedModuleEntries, ModuleRegistry, NotDuplicated } from '..';
// import { DefinitionsSet } from '../module/DefinitionsSet';
//
export const a = 1;
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

// type Curried<A extends any[], R> = <P extends Partial<A>>(
//   ...args: P
// ) => P extends A ? R : A extends [...SameLength<P>, ...infer S] ? (S extends any[] ? Curried<S, R> : never) : never;


// type PartiallyApplied = {
//   <R, A extends any[], D extends any[]>(fn: (...args: A) => R, deps: D);
// };


// type Opt<T extends any[]> = T extends [...infer TPRev, any] ? T | Opt<TPRev> : never
// type ZZZZ = Opt<[1,2,3]>
// type Zsdf = Partial<[1,2]>
//
// const zsdz:Zsdf = [undefined, 2]

// type Z = Curried<[number, string], boolean>;
//
// function curry<A extends any[], R>(fn: (...args: A) => R): Curried<A, R> {
//   return (...args: any[]): any =>
//     args.length >= fn.length ? fn(...(args as any)) : curry((fn as any).bind(undefined, ...args));
// }
//
// const zz = curry((a: number, b: string) => true);
//
// const result = zz(2, 'sdf');
// const result2 = zz(2);
