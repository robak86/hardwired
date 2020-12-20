import { PropType } from '../utils/PropType';
import { ModuleId } from './ModuleId';
import { ImmutableSet } from '../collections/ImmutableSet';
import invariant from 'tiny-invariant';
import { Thunk } from '../utils/Thunk';
import { AnyResolver, MaterializedRecord, Module, PropTypesObject, PropTypesTuple } from '../resolvers/abstract/Module';
import { Instance } from '../resolvers/abstract/Instance';

export const module = (name: string) => ModuleBuilder.empty(name);
export const unit = module;

export class ModuleBuilder<TRecord extends Record<string, AnyResolver>> extends Module<TRecord> {
  static empty(name: string): ModuleBuilder<{}> {
    return new ModuleBuilder<{}>(ModuleId.build(name), ImmutableSet.empty() as any);
  }

  import<TKey extends string, TValue extends Module<any>>(
    name: TKey,
    resolver: Thunk<TValue>,
  ): ModuleBuilder<TRecord & Record<TKey, TValue>> {
    invariant(!this.registry.hasKey(name), `Dependency with name: ${name} already exists`);

    return new ModuleBuilder(
      ModuleId.next(this.moduleId),
      this.registry.extend(name, {
        resolverThunk: resolver,
        dependencies: [],
      }) as any,
    );
  }

  define<TKey extends string, TValue>(
    name: TKey,
    resolver: Instance<TValue, []>,
  ): ModuleBuilder<TRecord & Record<TKey, Instance<TValue, []>>>;
  define<TKey extends string, TValue, TDepKey extends Module.Paths<TRecord>, TDepsKeys extends [TDepKey, ...TDepKey[]]>(
    name: TKey,
    resolver: Instance<TValue, PropTypesTuple<TDepsKeys, MaterializedRecord<TRecord>>>,
    dependencies: TDepsKeys,
  ): ModuleBuilder<TRecord & Record<TKey, Instance<TValue, PropTypesTuple<TDepsKeys, MaterializedRecord<TRecord>>>>>;
  define<TKey extends string, TValue, TDepKey extends Module.Paths<TRecord>, TDepsKeys extends [TDepKey, ...TDepKey[]]>(
    name: TKey,
    resolver: Instance<TValue, []> | Instance<TValue, PropTypesTuple<TDepsKeys, MaterializedRecord<TRecord>>>,
    dependencies?: TDepsKeys,
  ): unknown {
    invariant(!this.registry.hasKey(name), `Dependency with name: ${name} already exists`);

    return new ModuleBuilder(
      ModuleId.next(this.moduleId),
      this.registry.extend(name, {
        resolverThunk: resolver,
        dependencies: dependencies || [],
      }) as any,
    ) as any;
  }

  defineStructured<
    TKey extends string,
    TValue,
    TDepKey extends Module.Paths<TRecord>,
    TDepsRecord extends Record<TDepsKey, TDepKey>,
    TDepsKey extends string
  >(
    name: TKey,
    resolver: Instance<TValue, [{ [K in TDepsKey]: PropType<MaterializedRecord<TRecord>, TDepsRecord[K] & string> }]>,
    dependencies: TDepsRecord,
  ): ModuleBuilder<
    TRecord & Record<TKey, Instance<TValue, [PropTypesObject<TDepsRecord, MaterializedRecord<TRecord>>]>>
  > {
    throw new Error('Implement me');
  }

  replace<TKey extends string, TValue extends Instance.Unbox<TRecord[TKey]>>(
    name: TKey,
    resolver: Instance<TValue, []>,
  ): ModuleBuilder<TRecord>;
  replace<
    TKey extends string,
    TValue extends Instance.Unbox<TRecord[TKey]>,
    TDepKey extends Module.Paths<TRecord>,
    TDepsKeys extends [TDepKey, ...TDepKey[]]
  >(
    name: TKey,
    resolver: Instance<TValue, PropTypesTuple<TDepsKeys, MaterializedRecord<TRecord>>>,
    dependencies: TDepsKeys,
  ): ModuleBuilder<TRecord>;
  replace<
    TKey extends string,
    TValue extends Instance.Unbox<TRecord[TKey]>,
    TDepKey extends Module.Paths<TRecord>,
    TDepsKeys extends [TDepKey, ...TDepKey[]]
  >(name: TKey, resolver: Instance<any, any>, dependencies?: TDepsKeys): ModuleBuilder<TRecord> {
    invariant(this.registry.hasKey(name), `Cannot replace definition. Definition: ${name} does not exist.`);

    return new ModuleBuilder(
      this.moduleId,
      this.registry.replace(name, {
        resolverThunk: resolver,
        dependencies: dependencies || [],
      }),
    );
  }
}
