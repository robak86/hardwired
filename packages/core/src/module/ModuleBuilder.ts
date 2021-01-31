import { ModuleId } from './ModuleId';
import { ImmutableMap } from '../collections/ImmutableMap';
import invariant from 'tiny-invariant';
import { Thunk } from '../utils/Thunk';
import { AnyResolver, Module, ModuleRecord, PropTypesTuple } from '../resolvers/abstract/Module';
import { Instance } from '../resolvers/abstract/Instance';
import { LiteralResolverDefinition } from '../resolvers/LiteralResolver';
import { BuildStrategy } from '../strategies/abstract/BuildStrategy';
import { singleton } from '../strategies/SingletonStrategy';

export const module = () => ModuleBuilder.empty();
export const unit = module;

export class ModuleBuilder<TRecord extends Record<string, AnyResolver>> {
  static empty(): ModuleBuilder<{}> {
    return new ModuleBuilder<{}>(ModuleId.build(), ImmutableMap.empty() as any, { isFrozen: false });
  }

  protected constructor(
    public moduleId: ModuleId,
    public registry: ImmutableMap<Record<string, Module.BoundResolver>>,
    private isFrozenRef: { isFrozen: boolean },
  ) {}

  isEqual(otherModule: Module<any>): boolean {
    return this.moduleId.id === otherModule.moduleId.id;
  }

  import<TKey extends string, TValue extends Module<any>>(
    name: TKey,
    resolver: Thunk<TValue>,
  ): ModuleBuilder<TRecord & Record<TKey, TValue>> {
    invariant(!this.registry.hasKey(name), `Dependency with name: ${name} already exists`);
    invariant(!this.isFrozenRef.isFrozen, `Module is frozen. Cannot import additional modules.`);

    return new ModuleBuilder(
      ModuleId.next(this.moduleId),
      this.registry.extend(name, {
        resolverThunk: resolver,
        dependencies: [],
      }) as any,
      this.isFrozenRef,
    );
  }

  literal<TKey extends string, TValue>(
    name: TKey,
    buildFn: (ctx: ModuleRecord.Materialized<TRecord>) => TValue,
    buildStrategy: (resolver: (ctx: ModuleRecord.Materialized<TRecord>) => TValue) => BuildStrategy<TValue> = singleton,
  ): ModuleBuilder<TRecord & Record<TKey, Instance<TValue, []>>> {
    invariant(!this.isFrozenRef.isFrozen, `Cannot add definitions to frozen module`);

    return new ModuleBuilder(
      ModuleId.next(this.moduleId),
      this.registry.extend(name, {
        resolverThunk: buildStrategy(buildFn),
        dependencies: [],
      }) as any,
      this.isFrozenRef,
    );
  }

  // TODO: is it necessary to return Instance with TDeps?  TDeps are not necessary after the instance is registered
  define<TKey extends string, TValue>(
    name: TKey,
    buildFn: (ctx: ModuleRecord.Materialized<TRecord>) => TValue,
    buildStrategy: (resolver: (ctx: ModuleRecord.Materialized<TRecord>) => TValue) => BuildStrategy<TValue>,
  ): ModuleBuilder<TRecord & Record<TKey, Instance<TValue, []>>>;
  define<TKey extends string, TValue>(
    name: TKey,
    resolver: LiteralResolverDefinition<ModuleRecord.Materialized<TRecord>, TValue>,
  ): ModuleBuilder<TRecord & Record<TKey, Instance<TValue, []>>>;
  define<TKey extends string, TValue>(
    name: TKey,
    resolver: Instance<TValue, []>,
  ): ModuleBuilder<TRecord & Record<TKey, Instance<TValue, []>>>;
  define<TKey extends string, TValue, TDepKey extends Module.Paths<TRecord>, TDepsKeys extends [TDepKey, ...TDepKey[]]>(
    name: TKey,
    resolver: Instance<TValue, PropTypesTuple<TDepsKeys, ModuleRecord.Materialized<TRecord>>>,
    dependencies: TDepsKeys,
  ): ModuleBuilder<
    TRecord & Record<TKey, Instance<TValue, PropTypesTuple<TDepsKeys, ModuleRecord.Materialized<TRecord>>>>
  >;
  define<TKey extends string, TValue, TDepKey extends Module.Paths<TRecord>, TDepsKeys extends [TDepKey, ...TDepKey[]]>(
    name: TKey,
    resolver:
      | Instance<TValue, []>
      | Instance<TValue, PropTypesTuple<TDepsKeys, ModuleRecord.Materialized<TRecord>>>
      | LiteralResolverDefinition<ModuleRecord.Materialized<TRecord>, TValue>
      | ((ctx: ModuleRecord.Materialized<TRecord>) => TValue),

    dependencies?: TDepsKeys | BuildStrategy<TValue>,
  ): unknown {
    invariant(!this.registry.hasKey(name), `Dependency with name: ${name} already exists`);
    invariant(!this.isFrozenRef.isFrozen, `Cannot add definitions to frozen module`);
    return new ModuleBuilder(
      ModuleId.next(this.moduleId),
      this.registry.extend(name, {
        resolverThunk: resolver,
        dependencies: dependencies || [],
      }) as any,
      this.isFrozenRef,
    ) as any;
  }

  freeze(): Module<TRecord> {
    invariant(!this.isFrozenRef.isFrozen, `Cannot freeze the module. Module is already frozen.`);
    this.isFrozenRef.isFrozen = true;
    return new Module(this.moduleId, this.registry) as Module<TRecord>;
  }
}
