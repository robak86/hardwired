import { AllowedKeys } from '../path';
import { PropType } from '../utils/PropType';
import { ModuleId } from './ModuleId';
import { ImmutableSet } from '../collections/ImmutableSet';
import invariant from 'tiny-invariant';
import { Instance, AbstractModuleResolver } from '../resolvers/abstract/AbstractResolvers';
import { ContainerContext } from '../container/ContainerContext';
import { Thunk } from '../utils/Thunk';

// prettier-ignore
type UnboxModuleEntry<T> =
  T extends Instance<infer TInstance, any> ? TInstance : 'cannot unwrap instance type from Instance'

// type Instance<T> = {
//   kind: 'definition';
//   instance: T;
// };

export type ModuleEntriesRecord = Record<string, ModuleEntry>;

// export type ModuleEntries<T extends Record<string, ModuleEntry>> = {
//   kind: 'module';
//   entries: { [K in keyof T]: any };
// };

export type ModuleEntry = Instance<any, any> | AbstractModuleResolver<any>;

// prettier-ignore
export type MaterializeModule<TModule extends ModuleBuilder<any>> =
  TModule extends ModuleBuilder<infer TRecord> ? { //TODO: should be inferred from AbstractModuleResolver<infer TRecord>
        [K in keyof TRecord & string]: TRecord[K] extends ModuleBuilder<infer TModule> ? MaterializeModule<TRecord[K]> :

                               TRecord[K] extends Instance<infer TInstance, any> ? TInstance : 'co do chuja'
  } : never;

// prettier-ignore
export type MaterializedRecord<TRecord extends Record<string, ModuleEntry>> = {
  [K in keyof TRecord]: TRecord[K] extends Instance<infer TInstanceType, any> ? TInstanceType
                        : TRecord[K] extends AbstractModuleResolver<infer TRecord> ? MaterializedRecord<TRecord> : unknown

};

// prettier-ignore
export type ModuleInstancesKeys<TModule extends ModuleBuilder<any>> =
  TModule extends ModuleBuilder<infer TRecord> ?
    ({[K in keyof TRecord]: TRecord[K] extends Instance<infer A, infer B> ? K : never })[keyof TRecord] : unknown

export type ModuleRecordInstancesKeys<TRecord extends Record<string, ModuleEntry>> = {
  [K in keyof TRecord]: TRecord[K] extends Instance<any, any> ? K : never;
}[keyof TRecord];

type ModuleResolvers<TEntries extends Record<string, ModuleEntry>> = {
  [K in keyof TEntries & string]: any;
};

// type NextRecord<TValue> = TValue extends ModuleEntries<any> ? TValue : Instance<TValue>;
type NextRecord<TValue> = TValue; //extends ModuleEntries<any> ? TValue : Instance<TValue>;

export class ModuleBuilder<TRecord extends Record<string, ModuleEntry>> extends AbstractModuleResolver<TRecord> {
  kind: 'moduleResolver' = 'moduleResolver';

  entries;

  static empty(name: string): ModuleBuilder<{}> {
    return new ModuleBuilder<{}>(ModuleId.build(name), ImmutableSet.empty() as any, ImmutableSet.empty() as any);
  }

  protected constructor(
    public moduleId: ModuleId,
    public registry: ImmutableSet<ModuleResolvers<TRecord>>,
    public injections: ImmutableSet<Record<string, ModuleBuilder<any>>>,
  ) {
    super();
  }

  // TODO: simplify other overloads  similarly as for AbstractModuleResolver
  define<TKey extends string, TValue extends AbstractModuleResolver<any>>(
    name: TKey,
    resolver: Thunk<TValue>,
  ): ModuleBuilder<TRecord & Record<TKey, TValue>>;

  define<TKey extends string, TValue>(
    name: TKey,
    resolver: Instance<TValue, []>,
  ): ModuleBuilder<TRecord & Record<TKey, Instance<TValue, []>>>;
  define<TKey extends string, TValue, TDepKey extends AllowedKeys<TRecord>, TDepsKeys extends [TDepKey, ...TDepKey[]]>(
    name: TKey,
    resolver: Instance<TValue, Deps<TDepsKeys, MaterializedRecord<TRecord>>>,
    dependencies: TDepsKeys,
  ): ModuleBuilder<
    TRecord & Record<TKey, Instance<TValue, Deps<TDepsKeys, MaterializedRecord<TRecord>>>>
  >;
  define<TKey extends string, TValue, TDepKey extends AllowedKeys<TRecord>, TDepsKeys extends [TDepKey, ...TDepKey[]]>(
    name: TKey,
    resolver: Instance<any, any> | Thunk<AbstractModuleResolver<any>>,
    dependencies?: TDepsKeys,
  ): ModuleBuilder<TRecord & Record<TKey, unknown>> {
    invariant(!this.registry.hasKey(name), `Dependency with name: ${name} already exists`);

    return new ModuleBuilder(
      ModuleId.next(this.moduleId),
      this.registry.extend(name, {
        resolver,
        dependencies: dependencies || [],
      }),
      this.injections,
    );
  }


  replace<TKey extends string, TValue extends UnboxModuleEntry<TRecord[TKey]>>(
    name: TKey,
    resolver: Instance<TValue, []>,
  ): ModuleBuilder<TRecord>;
  replace<
    TKey extends string,
    TValue extends UnboxModuleEntry<TRecord[TKey]>,
    TDepKey extends AllowedKeys<TRecord>,
    TDepsKeys extends [TDepKey, ...TDepKey[]]
  >(
    name: TKey,
    resolver: Instance<TValue, Deps<TDepsKeys, MaterializedRecord<TRecord>>>,
    dependencies: TDepsKeys,
  ): ModuleBuilder<TRecord>;
  replace<
    TKey extends string,
    TValue extends UnboxModuleEntry<TRecord[TKey]>,
    TDepKey extends AllowedKeys<TRecord>,
    TDepsKeys extends [TDepKey, ...TDepKey[]]
  >(name: TKey, resolver: Instance<any, any>, dependencies?: TDepsKeys): ModuleBuilder<TRecord> {
    invariant(!this.registry.hasKey(name), `Dependency with name: ${name} already exists`);

    return new ModuleBuilder(
      ModuleId.next(this.moduleId),
      this.registry.replace(name, {
        resolver,
        dependencies,
      } as any),
      this.injections,
    );
  }

  inject(...args: any[]): this {
    throw new Error('Implement me');
  }
}

type Deps<T extends string[], TDeps extends Record<string, unknown>> = {
  [K in keyof T]: PropType<TDeps, T[K] & string>;
};

// const m = ModuleBuilder.empty('');

export class TestClass {
  constructor(private a: number, private b: string) {}
}

export class TestClassUsing {
  constructor(private a: TestClass) {}
}

export class NoArgsClass {
  constructor() {}
}
