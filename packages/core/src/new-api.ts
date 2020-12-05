import { ClassType, NoConstructorArgsClassType } from './utils/ClassType';
import { AllowedKeys, PropType } from './path';

type Definition<T> = {
  instance: T;
};

const def = <T>(val: T) => ({ instance: val });

export type ModuleEntry = Definition<any> | M<any>;

type MaterializeModule<TModule extends ModuleEntry> = TModule extends Definition<infer TInstanceType>
  ? TInstanceType
  : TModule extends M<infer TRecord>
  ? { [K in keyof TRecord]: MaterializeModule<TRecord[K]> }
  : never;

type MaterializedRecord<TRecord extends Record<string, ModuleEntry>> = {
  [K in keyof TRecord]: MaterializeModule<TRecord[K]>;
};

type M1 = M<{
  a: Definition<number>;
  b: Definition<string>;
  c: M<{
    e: Definition<number>;
    f: M<{
      g: Definition<boolean>;
    }>;
  }>;
}>;

type WTF2 = MaterializeModule<M1>;

type MaterializedPath = PropType<WTF2, 'c.f.g'>;

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

export class M<TRecord extends Record<string, ModuleEntry>> {
  define<TKey extends string, TValue extends ModuleEntry>(
    key: TKey,
    value: TValue,
    keys: AllowedKeys<TRecord>[] = [],
  ): M<TRecord & Record<TKey, TValue>> {
    throw new Error('Implement me');
  }

  defineClass<TKey extends string, TValue, TDepsKeys extends AllowedKeys<TRecord>[]>(
    key: TKey,
    value: ClassType<Deps<TDepsKeys, MaterializedRecord<TRecord>>, TValue>,
    keys: TDepsKeys,
  ): M<TRecord & Record<TKey, TValue>> {
    throw new Error('Implement me');
  }

  // FAIL
  defineClassOverride<TKey extends string, TValue>(key: TKey, value: NoConstructorArgsClassType<TValue>);
  defineClassOverride<TKey extends string, TValue, TDepsKeys extends AllowedKeys<TRecord>[]>(
    key: TKey,
    value: ClassType<Deps<TDepsKeys, MaterializedRecord<TRecord>>, TValue>,
    keys: TDepsKeys,
  );
  defineClassOverride<TKey extends string, TValue, TDepsKeys extends AllowedKeys<TRecord>[]>(
    key: TKey,
    value: ClassType<Deps<TDepsKeys, MaterializedRecord<TRecord>>, TValue>,
    keys?: TDepsKeys,
  ): M<TRecord & Record<TKey, TValue>> {
    throw new Error('Implement me');
  }

  defineClassOverrideExplicit<TKey extends string, TValue>(key: TKey, value: ClassType<[], TValue>);
  defineClassOverrideExplicit<TKey extends string, TValue, TDepsKeys extends [AllowedKeys<TRecord>]>(
    key: TKey,
    value: ClassType<Deps<TDepsKeys, MaterializedRecord<TRecord>>, TValue>,
    keys: TDepsKeys,
  );
  defineClassOverrideExplicit<
    TKey extends string,
    TValue,
    TDepsKeys extends [AllowedKeys<TRecord>, AllowedKeys<TRecord>]
  >(key: TKey, value: ClassType<Deps<TDepsKeys, MaterializedRecord<TRecord>>, TValue>, keys: TDepsKeys);

  defineClassOverrideExplicit<TKey extends string, TValue, TDepsKeys extends AllowedKeys<TRecord>[]>(
    key: TKey,
    value: ClassType<Deps<TDepsKeys, MaterializedRecord<TRecord>>, TValue>,
    keys?: TDepsKeys,
  ): M<TRecord & Record<TKey, TValue>> {
    throw new Error('Implement me');
  }

  defineUniversal<TKey extends string, TValue, TDepsKeys extends AllowedKeys<TRecord>[]>(
    key: TKey,
    value: TResolver<Deps<TDepsKeys, MaterializedRecord<TRecord>>, TValue>,
    keys: TDepsKeys,
  ): M<TRecord & Record<TKey, TValue>> {
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

type WWW = Deps<['a', 'c.f.g'], WTF2>;

// type DefinitionFunc<TValue, TDeps, TRecord extends Record<string, ModuleEntry>, TDeps> = [TValue, AllowedKeys<TRecord>[]]

const m = new M<{}>();

class TestClass {
  constructor(private a: number, private b: string) {}
}

class NoArgsClass {
  constructor() {}
}

const m1 = m.define('a', def(1)).define('b', def('string'));

const m2 = m.define('aa', def(1)).define('import', m1).define('bb', def(true), ['import.b']);

m2.defineClass('cls', TestClass, ['aa', 'import.b']);

m2.defineClassOverrideExplicit('cls', TestClass, ['aa', 'import.b']);
m2.defineClassOverrideExplicit('cls', NoArgsClass);

const myk = singleton(TestClass);
const waa = m2.defineUniversal('cls', singleton(TestClass), ['aa', 'import.b']);
m2.defineUniversal('cls', singleton(TestClass), []);
