import { ClassType } from './utils/ClassType';
import { AllowedKeys } from './path';
import { PropType } from './utils/PropType';
import { ModuleId } from './module/ModuleId';
import { ImmutableSet } from './collections/ImmutableSet';
import invariant from 'tiny-invariant';

type Instance<T> = {
  kind: 'definition';
  instance: T;
};

type ModuleEntries<T extends Record<string, ModuleEntry>> = {
  kind: 'module';
  entries: { [K in keyof T]: any };
};

export type ModuleEntry = Instance<any> | ModuleEntries<any>;

export type MaterializeModule<TModule extends ModuleEntry> = TModule extends Instance<infer TInstanceType>
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

type ModuleResolvers<TEntries extends Record<string, ModuleEntry>> = {
  [K in keyof TEntries & string]: BoundResolver;
};

export class Module<TRecord extends Record<string, ModuleEntry>> implements ModuleEntries<TRecord> {
  kind: 'module' = 'module';
  entries;

  static empty(name: string): Module<{}> {
    return new Module<{}>(ModuleId.build(name), ImmutableSet.empty() as any, ImmutableSet.empty() as any);
  }

  protected constructor(
    public moduleId: ModuleId,
    public registry: ImmutableSet<ModuleResolvers<TRecord>>,
    public injections: ImmutableSet<Record<string, Module<any>>>,
  ) {}

  define<TKey extends string, TValue>(
    name: TKey,
    resolver: ModuleEntryResolver<TValue, []>,
  ): Module<TRecord & Record<TKey, TValue extends ModuleEntries<any> ? TValue : Instance<TValue>>>;
  define<TKey extends string, TValue, TDepKey extends AllowedKeys<TRecord>, TDepsKeys extends [TDepKey, ...TDepKey[]]>(
    name: TKey,
    resolver: ModuleEntryResolver<TValue, Deps<TDepsKeys, MaterializedRecord<TRecord>>>,
    dependencies: TDepsKeys,
  ): Module<TRecord & Record<TKey, TValue extends ModuleEntries<any> ? TValue : Instance<TValue>>>;
  define<TKey extends string, TValue, TDepKey extends AllowedKeys<TRecord>, TDepsKeys extends [TDepKey, ...TDepKey[]]>(
    name: TKey,
    resolver: ModuleEntryResolver<any, any>,
    dependencies?: TDepsKeys,
  ): Module<TRecord & Record<TKey, TValue extends ModuleEntries<any> ? TValue : Instance<TValue>>> {
    invariant(!this.registry.hasKey(name), `Dependency with name: ${name} already exists`);

    return new Module(
      ModuleId.next(this.moduleId),
      this.registry.extend(name, {
        resolver,
        dependencies,
      }),
      this.injections,
    );
  }
}

type ModuleEntryResolver<TValue, TDeps extends any[]> = InstanceResolver<TValue, TDeps> | ModuleResolver<TValue, TDeps>;

type BoundResolver = {
  resolver: ModuleEntryResolver<any, any>;
  dependencies: string[];
};

type InstanceResolver<TValue, TDeps extends any[]> = {
  kind: 'instanceResolver';
  deps: TDeps;
  value: TValue;
};

type ModuleResolver<TValue, TDeps extends any[]> = {
  kind: 'moduleResolver';
  deps: TDeps;
  value: TValue;
};

export function singleton<TDeps extends any[], TValue>(
  cls: ClassType<TDeps, TValue>,
): ModuleEntryResolver<TValue, TDeps> {
  throw new Error('implement me');
}

type Deps<T extends string[], TDeps extends Record<string, unknown>> = {
  [K in keyof T]: PropType<TDeps, T[K] & string>;
};

const m = Module.empty('');

export class TestClass {
  constructor(private a: number, private b: string) {}
}

export class TestClassUsing {
  constructor(private a: TestClass) {}
}

export class NoArgsClass {
  constructor() {}
}

export const value = <TValue>(value: TValue): ModuleEntryResolver<TValue, []> => {
  throw new Error('implement me');
};

export const moduleImport = <TValue extends ModuleEntries<any>>(value: TValue): ModuleEntryResolver<TValue, []> => {
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
