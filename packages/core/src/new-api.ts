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

const m1 = m
  .define('a', def(1))
  .define('b', def('string'))
  .define('1b', def('string'))
  .define('12b', def('string'))
  .define('123b', def('string'))
  .define('1234b', def('string'))
  .define('12345b', def('string'))
  .define('123456b', def('string'))
  .define('2b', def('string'))
  .define('22b', def('string'))
  .define('223b', def('string'))
  .define('2234b', def('string'))
  .define('22345b', def('string'))
  .define('223456b', def('string'))
  .define('3b', def('string'))
  .define('32b', def('string'))
  .define('323b', def('string'))
  .define('3234b', def('string'))
  .define('32345b', def('string'))
  .define('323456b', def('string'))
  .define('4b', def('string'))
  .define('42b', def('string'))
  .define('423b', def('string'))
  .define('4234b', def('string'))
  .define('42345b', def('string'))
  .define('423456b', def('string'))
  .define('5b', def('string'))
  .define('52b', def('string'))
  .define('523b', def('string'))
  .define('5234b', def('string'))
  .define('52345b', def('string'))
  .define('523456b', def('string'))
  .define('6b', def('string'))
  .define('62b', def('string'))
  .define('623b', def('string'))
  .define('6234b', def('string'))
  .define('62345b', def('string'))
  .define('623456b', def('string'));

const m2 = m.define('aa', def(1)).define('import', m1).define('bb', def(true), ['import.b']);

m2.defineClass('cls', TestClass, ['aa', 'import.b']);

m2.defineClassOverrideExplicit('cls', TestClass, ['aa', 'import.b']);
m2.defineClassOverrideExplicit('cls', NoArgsClass);

const myk = singleton(TestClass);
const waa = m2
  .defineUniversal('cls', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('cls2', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('cls3', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('cls4', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('cls5', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('cls6', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('cls7', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('cls8', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('cls9', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('cls', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('1cls2', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('2cls2', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('4cls2', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('5cls2', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('6cls2', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('7cls2', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('1cls3', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('2cls3', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('4cls3', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('5cls3', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('6cls3', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('7cls3', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('1cls4', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('2cls4', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('4cls4', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('5cls4', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('6cls4', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('7cls4', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('1cls5', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('2cls5', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('4cls5', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('5cls5', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('6cls5', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('7cls5', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('1cls6', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('2cls6', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('4cls6', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('5cls6', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('6cls6', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('7cls6', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('1cls7', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('2cls7', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('4cls7', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('5cls7', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('6cls7', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('7cls7', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('1cls8', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('2cls8', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('4cls8', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('5cls8', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('6cls8', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('7cls8', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('1cls9', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('2cls9', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('4cls9', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('5cls9', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('6cls9', singleton(TestClass), ['aa', 'import.b'])
  .defineUniversal('7cls9', singleton(TestClass), ['aa', 'import.b']);
