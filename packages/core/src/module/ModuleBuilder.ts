import { AllowedKeys } from '../path';
import { PropType } from '../utils/PropType';
import { ModuleId } from './ModuleId';
import { ImmutableSet } from '../collections/ImmutableSet';
import invariant from 'tiny-invariant';
import { Module, Instance } from '../resolvers/abstract/AbstractResolvers';
import { Thunk } from '../utils/Thunk';
import { value } from '../resolvers/ValueResolver';
import { singleton } from '../resolvers/ClassSingletonResolver';

// prettier-ignore
type UnboxModuleEntry<T> =
  T extends Instance<infer TInstance, any> ? TInstance : 'cannot unwrap instance type from Instance'

export type ModuleEntriesRecord = Record<string, AnyResolver>;

export type AnyResolver = Instance<any, any> | Module<any>;

// prettier-ignore
export type MaterializeModule<TModule extends ModuleBuilder<any>> =
  TModule extends ModuleBuilder<infer TRecord> ? { //TODO: should be inferred from AbstractModuleResolver<infer TRecord>
        [K in keyof TRecord & string]: TRecord[K] extends ModuleBuilder<infer TModule> ? MaterializeModule<TRecord[K]> :

                               TRecord[K] extends Instance<infer TInstance, any> ? TInstance : 'co do chuja'
  } : never;

// prettier-ignore
export type MaterializedRecord<TRecord extends Record<string, AnyResolver>> = {
  [K in keyof TRecord]: TRecord[K] extends Instance<infer TInstanceType, any> ? TInstanceType
                        : TRecord[K] extends Module<infer TRecord> ? MaterializedRecord<TRecord> : unknown

};

// prettier-ignore
export type ModuleInstancesKeys<TModule extends ModuleBuilder<any>> =
  TModule extends ModuleBuilder<infer TRecord> ?
    ({[K in keyof TRecord]: TRecord[K] extends Instance<infer A, infer B> ? K : never })[keyof TRecord] : unknown

export type ModuleRecordInstancesKeys<TRecord extends Record<string, AnyResolver>> = {
  [K in keyof TRecord]: TRecord[K] extends Instance<any, any> ? K : never;
}[keyof TRecord];

export type ModuleResolvers<TEntries extends Record<string, AnyResolver>> = {
  [K in keyof TEntries & string]: any;
};

export class ModuleBuilder<TRecord extends Record<string, AnyResolver>> extends Module<TRecord> {
  static empty(name: string): ModuleBuilder<{}> {
    return new ModuleBuilder<{}>(ModuleId.build(name), ImmutableSet.empty() as any, ImmutableSet.empty() as any);
  }

  defineStructured<
    TKey extends string,
    TValue,
    TDepKey extends AllowedKeys<TRecord>,
    TDepsRecord extends Record<TDepsKey, TDepKey>,
    TDepsKey extends string
  >(
    name: TKey,
    resolver: Instance<TValue, [{ [K in TDepsKey]: PropType<MaterializedRecord<TRecord>, TDepsRecord[K] & string> }]>,
    dependencies: TDepsRecord,
  ): ModuleBuilder<
    TRecord & Record<TKey, Instance<TValue, [PropTypesObject<TDepsRecord, MaterializedRecord<TRecord>>]>>
  > {
    invariant(!this.registry.hasKey(name), `Dependency with name: ${name} already exists`);

    return new ModuleBuilder(
      ModuleId.next(this.moduleId),
      this.registry.extend(name, {
        resolverThunk: resolver,
        dependencies: dependencies || [],
      }) as any,
      this.injections,
    );
  }

  defineStructured2<
    TKey extends string,
    TValue,
    TDepKey extends AllowedKeys<TRecord>,
    TDepsRecord extends Record<string, TDepKey>,
    // TDepsRecord extends { [K in keyof TDeps]: PropType<MaterializedRecord<TRecord>, TDeps[K] & string> }

    //PropTypesObject<TDepsRecord, MaterializedRecord<TRecord>>
    TDeps extends { [K in keyof TDepsRecord]: PropType<MaterializedRecord<TRecord>, TDepsRecord[K]> }
  >(
    name: TKey,
    resolver: Instance<TValue, [TDeps]>,
    dependencies: TDepsRecord,
  ): ModuleBuilder<
    TRecord & Record<TKey, Instance<TValue, [PropTypesObject<TDepsRecord, MaterializedRecord<TRecord>>]>>
  > {
    invariant(!this.registry.hasKey(name), `Dependency with name: ${name} already exists`);

    return new ModuleBuilder(
      ModuleId.next(this.moduleId),
      this.registry.extend(name, {
        resolverThunk: resolver,
        dependencies: dependencies || [],
      }) as any,
      this.injections,
    );
  }
  // defineStructured<
  //   TKey extends string,
  //   TValue,
  //   TDepKey extends AllowedKeys<TRecord>,
  //   TDepsKeys extends Record<string, TDepKey>
  // >(
  //   name: TKey,
  //   resolver: Instance<TValue, [PropTypesObject<TDepsKeys, MaterializedRecord<TRecord>>]>,
  //   dependencies: TDepsKeys,
  // ): ModuleBuilder<
  //   TRecord & Record<TKey, Instance<TValue, [PropTypesObject<TDepsKeys, MaterializedRecord<TRecord>>]>>
  // > {
  //   invariant(!this.registry.hasKey(name), `Dependency with name: ${name} already exists`);
  //
  //   return new ModuleBuilder(
  //     ModuleId.next(this.moduleId),
  //     this.registry.extend(name, {
  //       resolverThunk: resolver,
  //       dependencies: dependencies || [],
  //     }) as any,
  //     this.injections,
  //   );
  // }

  // TODO: simplify other overloads  similarly as for AbstractModuleResolver
  define<TKey extends string, TValue extends Module<any>>(
    name: TKey,
    resolver: Thunk<TValue>,
  ): ModuleBuilder<TRecord & Record<TKey, TValue>>;

  define<TKey extends string, TValue>(
    name: TKey,
    resolver: Instance<TValue, []>,
  ): ModuleBuilder<TRecord & Record<TKey, Instance<TValue, []>>>;
  define<TKey extends string, TValue, TDepKey extends AllowedKeys<TRecord>, TDepsKeys extends [TDepKey, ...TDepKey[]]>(
    name: TKey,
    resolver: Instance<TValue, PropTypesTuple<TDepsKeys, MaterializedRecord<TRecord>>>,
    dependencies: TDepsKeys,
  ): ModuleBuilder<TRecord & Record<TKey, Instance<TValue, PropTypesTuple<TDepsKeys, MaterializedRecord<TRecord>>>>>;
  define<TKey extends string, TValue, TDepKey extends AllowedKeys<TRecord>, TDepsKeys extends [TDepKey, ...TDepKey[]]>(
    name: TKey,
    resolver: Instance<any, any> | Thunk<Module<any>>,
    dependencies?: TDepsKeys,
  ): ModuleBuilder<TRecord & Record<TKey, unknown>> {
    invariant(!this.registry.hasKey(name), `Dependency with name: ${name} already exists`);

    // TODO: for case where resolver is thunk add check for making sure that thunk returns always the same module (in case if somebody would like to build module dynamically)
    // Make sure that this check will be still evaluated lazily

    return new ModuleBuilder(
      ModuleId.next(this.moduleId),
      this.registry.extend(name, {
        resolverThunk: resolver,
        dependencies: dependencies || [],
      }) as any,
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
    resolver: Instance<TValue, PropTypesTuple<TDepsKeys, MaterializedRecord<TRecord>>>,
    dependencies: TDepsKeys,
  ): ModuleBuilder<TRecord>;
  replace<
    TKey extends string,
    TValue extends UnboxModuleEntry<TRecord[TKey]>,
    TDepKey extends AllowedKeys<TRecord>,
    TDepsKeys extends [TDepKey, ...TDepKey[]]
  >(name: TKey, resolver: Instance<any, any>, dependencies?: TDepsKeys): ModuleBuilder<TRecord> {
    invariant(this.registry.hasKey(name), `Cannot replace definition. Definition: ${name} does not exist.`);

    return new ModuleBuilder(
      ModuleId.next(this.moduleId),
      this.registry.replace(name, {
        resolverThunk: resolver,
        dependencies: dependencies || [],
      } as any),
      this.injections,
    );
  }

  inject(...args: any[]): this {
    throw new Error('Implement me');
  }
}

type PropTypesTuple<T extends string[], TDeps extends Record<string, unknown>> = {
  [K in keyof T]: PropType<TDeps, T[K] & string>;
};

type PropTypesObject<T extends Record<string, any>, TDeps extends Record<string, unknown>> = {
  [K in keyof T]: PropType<TDeps, T[K] & string>;
};
