import { ClassType } from "./utils/ClassType";
import { AllowedKeys } from "./path";
import { PropType } from "./utils/PropType";
import { Instance } from "./resolvers/abstract/Instance";
import { FunctionResolver } from "./resolvers/FunctionResolver";

type Definition<T> = {
  kind: 'definition';
  instance: T;
};

type ModuleRegistry<T extends Record<string, ModuleEntry>> = {
  kind: 'module';
  registry: { [K in keyof T]: any };
};

export type ModuleEntry = Definition<any> | ModuleRegistry<any>;

type MaterializeModule<TModule extends ModuleEntry> = TModule extends Definition<infer TInstanceType>
  ? TInstanceType
  : TModule extends Module<infer TRecord>
  ? { [K in keyof TRecord]: MaterializeModule<TRecord[K]> }
  : never;

type MaterializedRecord<TRecord extends Record<string, ModuleEntry>> = {
  [K in keyof TRecord]: MaterializeModule<TRecord[K]>;
};

// type M1 = M<{
//   a: Definition<number>;
//   b: Definition<string>;
//   c: M<{
//     e: Definition<number>;
//     f: M<{
//       g: Definition<boolean>;
//     }>;
//   }>;
// }>;
//
// type WTF2 = MaterializeModule<M1>;
//
// type MaterializedPath = PropType<WTF2, 'c.f.g'>;

// type DEb = AllowedKeys<M1>
//
// export type ClassSingletonBuilder = {
//   <TResult>(klass: ClassType<[], TResult>): ClassSingletonResolver<TResult>;
//   <TDeps extends any[], TResult>(
//     klass: ClassType<TDeps, TResult>,
//     depSelect: { [K in keyof TDeps]: Instance<TDeps[K]> },
//   ): ClassSingletonResolver<TResult>;
// };
//
// export const singleton: ClassSingletonBuilder = (klass, depSelect?) => {
//   return new ClassSingletonResolver(klass, depSelect);
// };

function asTupleOfLiterals<T extends string, U extends [T, ...T[]]>(tuple: U): U {
  return tuple;
}

const zz = asTupleOfLiterals(['a', 'b']);

export class Module<TRecord extends Record<string, ModuleEntry>> implements ModuleRegistry<TRecord> {
  kind: 'module' = 'module';
  registry;

  define<TKey extends string, TValue>(
    key: TKey,
    value: TResolver<[], TValue>,
  ): Module<TRecord & Record<TKey, TValue extends ModuleRegistry<any> ? TValue : Definition<TValue>>>;
  define<TKey extends string, TValue, TDepKey extends AllowedKeys<TRecord>, TDepsKeys extends [TDepKey, ...TDepKey[]]>(
    key: TKey,
    value: TResolver<Deps<TDepsKeys, MaterializedRecord<TRecord>>, TValue>,
    keys: TDepsKeys,
  ): Module<TRecord & Record<TKey, TValue extends ModuleRegistry<any> ? TValue : Definition<TValue>>>;
  define<TKey extends string, TValue, TDepKey extends AllowedKeys<TRecord>, TDepsKeys extends [TDepKey, ...TDepKey[]]>(
    key: TKey,
    value: any,
    keys?: TDepsKeys,
  ): Module<TRecord & Record<TKey, TValue extends ModuleRegistry<any> ? TValue : Definition<TValue>>> {
    throw new Error('Implement me');
  }
}

type TResolver<TDeps, TValue> = {
  deps: TDeps;
  value: TValue;
};

function singleton<TDeps extends any[], TValue>(cls: ClassType<TDeps, TValue>): TResolver<TDeps, TValue> {
  throw new Error('implement me');
}

type Deps<T extends string[], TDeps extends Record<string, unknown>> = {
  [K in keyof T]: PropType<TDeps, T[K] & string>;
};

const m = new Module<{}>();

class TestClass {
  constructor(private a: number, private b: string) {}
}

class TestClassUsing {
  constructor(private a: TestClass) {}
}

class NoArgsClass {
  constructor() {}
}

const value = <TValue>(value: TValue): TResolver<[], TValue> => {
  throw new Error('implement me');
};

const moduleImport = <TValue extends ModuleRegistry<any>>(value: TValue): TResolver<[], TValue> => {
  throw new Error('implement me');
};

const m222 = m.define('a', value(1)).define('b', value('string'));

const value1 = moduleImport(m222);
const value2 = value(1);

const mmm = m
  .define('imported', value1)
  .define('a', value2)
  .define('b', value('string'))
  .define('sdf', singleton(TestClass), ['a', 'b'])
  .define('sdf2', singleton(TestClassUsing), ['sdf']);

type Mat = MaterializeModule<typeof mmm>;
// .defineUniversal('cls', singleton(TestClass), ['a', 'b']);



type FunctionResolverBuilder = {
  <TResult>(fn: () => TResult): FunctionResolver<() => TResult>;
  <TDep1, TResult>(fn: (d1: TDep1) => TResult): FunctionResolver<(d1: TDep1) => TResult>;
  <TDep1, TResult>(fn: (d1: TDep1) => TResult, depSelect: [Instance<TDep1>]): FunctionResolver<() => TResult>;
  <TDep1, TDep2, TResult>(fn: (d1: TDep1, d2: TDep2) => TResult): FunctionResolver<(d1: TDep1, d2: TDep2) => TResult>;
  <TDep1, TDep2, TResult>(fn: (d1: TDep1, d2: TDep2) => TResult, depSelect: [Instance<TDep1>]): FunctionResolver<
    (dep2: TDep2) => TResult
    >;
  <TDep1, TDep2, TResult>(
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: [Instance<TDep1>, Instance<TDep2>],
  ): FunctionResolver<() => TResult>;
  // 3 args
  <TDep1, TDep2, TDep3, TResult>(fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult): FunctionResolver<
    (d1: TDep1, d2: TDep2, d3: TDep3) => TResult
    >;
  <TDep1, TDep2, TDep3, TResult>(
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: [Instance<TDep1>],
  ): FunctionResolver<(dep2: TDep2, dep3: TDep3) => TResult>;
  <TDep1, TDep2, TDep3, TResult>(
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: [Instance<TDep1>, Instance<TDep2>],
  ): FunctionResolver<(dep3: TDep3) => TResult>;
  <TDep1, TDep2, TDep3, TResult>(
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: [Instance<TDep1>, Instance<TDep2>, Instance<TDep3>],
  ): FunctionResolver<() => TResult>;
  <TDep1, TDep2, TDep3, TDep4, TResult>(
    fn: (d1: TDep1, d2: TDep2, d3: TDep3, d4: TDep4) => TResult,
    depSelect: [Instance<TDep1>, Instance<TDep2>, Instance<TDep3>, Instance<TDep4>],
  ): FunctionResolver<() => TResult>;
};
