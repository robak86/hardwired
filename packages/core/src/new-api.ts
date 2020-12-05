import { ClassType } from './utils/ClassType';
import { AllowedKeys } from './path';
import { PropType } from './utils/PropType';

type Definition<T> = {
  instance: T;
};

type ModuleRegistry<T extends Record<string, ModuleEntry>> = {
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
  registry;

  defineUniversal<TKey extends string, TValue, TDepsKeys extends AllowedKeys<TRecord>[]>(
    key: TKey,
    value: TResolver<Deps<TDepsKeys, MaterializedRecord<TRecord>>, TValue>,
    keys: TDepsKeys,
  ): Module<TRecord & Record<TKey, TValue extends ModuleRegistry<any> ? TValue : Definition<TValue>>> {
    throw new Error('Implement me');
  }

  defineUniversal2<
    TKey extends string,
    TValue,
    TDepKey extends AllowedKeys<TRecord>,
    TDepsKeys extends [TDepKey, ...TDepKey[]]
  >(
    key: TKey,
    value: TResolver<Deps<TDepsKeys, MaterializedRecord<TRecord>>, TValue>,
    keys: TDepsKeys,
  ): Module<TRecord & Record<TKey, TValue extends ModuleRegistry<any> ? TValue : Definition<TValue>>> {
    throw new Error('Implement me');
  }

  defineUniversalDebug<TKey extends string, TValue, TDepsKeys extends AllowedKeys<TRecord>[]>(
    key: TKey,
    keys: TDepsKeys,
  ): Deps<TDepsKeys, MaterializedRecord<TRecord>> {
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

const m222 = m.defineUniversal('a', value(1), []).defineUniversal('b', value('string'), []);

const mmm = m
  .defineUniversal('imported', moduleImport(m222), [])
  .defineUniversal('a', value(1), [])
  .defineUniversal('b', value('string'), [])
  .defineUniversal2('sdf', singleton(TestClass), ['a', 'b'])
  .defineUniversal('sdf2', singleton(TestClassUsing), ['sdf']);

type Mat = MaterializeModule<typeof mmm>;
// .defineUniversal('cls', singleton(TestClass), ['a', 'b']);
