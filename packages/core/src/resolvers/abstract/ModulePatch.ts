import { ModuleId } from '../../module/ModuleId';
import { ImmutableMap } from '../../collections/ImmutableMap';
import { Instance } from './Instance';
import { BuildStrategy } from '../../strategies/abstract/BuildStrategy';
import { singleton } from '../../strategies/SingletonStrategy';
import invariant from 'tiny-invariant';
import { DecoratorResolver } from '../DecoratorResolver';
import { AnyResolver, Module, ModuleRecord } from './Module';

export namespace ModulePatch {
  export type Materialized<TModule extends ModulePatch<any>> = TModule extends ModulePatch<infer TRecord>
    ? {
        [K in keyof TRecord & string]: TRecord[K] extends ModulePatch<infer TModule>
          ? Materialized<TRecord[K]>
          : TRecord[K] extends Instance<infer TInstance>
          ? TInstance
          : unknown;
      }
    : never;
}

export class ModulePatch<TRecord extends Record<string, AnyResolver>> {
  __definitions!: TRecord; // prevent erasing the type

  constructor(
    public moduleId: ModuleId,
    public registry: ImmutableMap<Record<string, Module.BoundResolver>>,
    public patchedResolvers: ImmutableMap<Record<string, Module.BoundResolver>>,
  ) {}

  isEqual(otherModule: ModulePatch<any>): boolean {
    return this.moduleId.id === otherModule.moduleId.id;
  }

  replace<TKey extends ModuleRecord.InstancesKeys<TRecord>, TValue extends Instance.Unbox<TRecord[TKey]>>(
    name: TKey,
    instance: Instance<TValue> | ((ctx: Omit<ModuleRecord.Materialized<TRecord>, TKey>) => Instance<TValue>),
  ): ModulePatch<TRecord>;

  replace<TKey extends ModuleRecord.InstancesKeys<TRecord>, TValue extends Instance.Unbox<TRecord[TKey]>>(
    name: TKey,
    buildFn: (ctx: Omit<ModuleRecord.Materialized<TRecord>, TKey>) => TValue,
    buildStrategy?: (
      resolver: (ctx: Omit<ModuleRecord.Materialized<TRecord>, TKey>) => TValue,
    ) => BuildStrategy<TValue>,
  ): ModulePatch<TRecord>;

  replace<TKey extends ModuleRecord.InstancesKeys<TRecord>, TValue extends Instance.Unbox<TRecord[TKey]>>(
    name: TKey,
    buildFnOrInstance: ((ctx: Omit<ModuleRecord.Materialized<TRecord>, TKey>) => TValue) | Instance<TValue>,
    buildStrategy = singleton,
  ): ModulePatch<TRecord> {
    invariant(
      !this.patchedResolvers.hasKey(name),
      `Cannot replace definition. Patch already contains replaced definition`,
    );

    if (typeof buildFnOrInstance === 'function') {
      return new ModulePatch(
        this.moduleId,
        this.registry,
        this.patchedResolvers.extend(name, {
          resolverThunk: buildStrategy(buildFnOrInstance),
        }) as any,
      );
    }

    return new ModulePatch(
      this.moduleId,
      this.registry,
      this.patchedResolvers.extend(name, {
        resolverThunk: buildFnOrInstance,
      }) as any,
    );
  }

  decorate<TKey extends ModuleRecord.InstancesKeys<TRecord>, TValue extends Instance.Unbox<TRecord[TKey]>>(
    name: TKey,
    decorateFn: (originalValue: TValue, moduleAsObject: ModuleRecord.Materialized<TRecord>) => TValue,
  ): ModulePatch<TRecord & Record<TKey, Instance<TValue>>> {
    const { resolverThunk } = this.patchedResolvers.get(name) || this.registry.get(name);

    const decorated = {
      resolverThunk: new DecoratorResolver(resolverThunk as any, decorateFn),
    };

    const replaced = this.patchedResolvers.extendOrSet(name, decorated);
    return new ModulePatch(this.moduleId, this.registry, replaced as any);
  }

  merge<TRecord extends Record<string, AnyResolver>>(otherModule: ModulePatch<TRecord>): ModulePatch<TRecord> {
    invariant(this.moduleId.id === otherModule.moduleId.id, `Cannot apply patch from module with different id`);

    return new ModulePatch<TRecord>(
      { id: this.moduleId.id },
      this.registry,
      this.patchedResolvers.merge(otherModule.patchedResolvers),
    );
  }
}
