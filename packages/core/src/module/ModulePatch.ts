import { ModuleId } from './ModuleId';
import { ImmutableMap } from '../collections/ImmutableMap';
import { singleton } from '../strategies/SingletonStrategy';
import invariant from 'tiny-invariant';
import { DecoratorStrategy } from '../strategies/DecoratorStrategy';
import { AnyResolver, isInstanceDefinition, Module, ModuleRecord } from './Module';
import { ApplyStrategy } from '../strategies/ApplyStrategy';
import { BuildStrategy } from '../strategies/abstract/BuildStrategy';

export namespace ModulePatch {
  export type Materialized<TModule extends ModulePatch<any>> = TModule extends ModulePatch<infer TRecord>
    ? {
        [K in keyof TRecord & string]: TRecord[K] extends ModulePatch<infer TModule>
          ? Materialized<TRecord[K]>
          : TRecord[K] extends BuildStrategy<infer TInstance>
          ? TInstance
          : unknown;
      }
    : never;
}

export class ModulePatch<TRecord extends Record<string, AnyResolver>> {
  __definitions!: TRecord; // prevent type erasure

  constructor(
    public moduleId: ModuleId,
    public registry: ImmutableMap<Record<string, Module.Definition>>,
    public patchedResolvers: ImmutableMap<Record<string, Module.InstanceDefinition>>, //TODO: maybe we should apply patches directly to this.registry ?
  ) {}

  isEqual(otherModule: ModulePatch<any>): boolean {
    return this.moduleId.revision === otherModule.moduleId.revision;
  }

  // TODO: allowing to replace strategy may be confusing because all replacements passed into globalOverrides become singletons
  //       while scopeOverrides does not change strategy
  replace<TKey extends ModuleRecord.InstancesKeys<TRecord>, TValue extends BuildStrategy.Unbox<TRecord[TKey]>>(
    name: TKey,
    instance: BuildStrategy<TValue> | ((ctx: Omit<ModuleRecord.Materialized<TRecord>, TKey>) => BuildStrategy<TValue>),
  ): ModulePatch<TRecord>;

  replace<TKey extends ModuleRecord.InstancesKeys<TRecord>, TValue extends BuildStrategy.Unbox<TRecord[TKey]>>(
    name: TKey,
    buildFn: (ctx: Omit<ModuleRecord.Materialized<TRecord>, TKey>) => TValue,
    buildStrategy?: (
      resolver: (ctx: Omit<ModuleRecord.Materialized<TRecord>, TKey>) => TValue,
    ) => BuildStrategy<TValue>,
  ): ModulePatch<TRecord>;

  replace<TKey extends ModuleRecord.InstancesKeys<TRecord>, TValue extends BuildStrategy.Unbox<TRecord[TKey]>>(
    name: TKey,
    buildFnOrInstance: ((ctx: Omit<ModuleRecord.Materialized<TRecord>, TKey>) => TValue) | BuildStrategy<TValue>,
    buildStrategy = singleton,
  ): ModulePatch<TRecord> {
    invariant(
      !this.patchedResolvers.hasKey(name),
      `Cannot replace definition. Patch already contains replaced definition`,
    );

    invariant(this.registry.hasKey(name), `Cannot replace definition: ${name} does not exist.`);
    const prev = this.registry.get(name);
    invariant(isInstanceDefinition(prev), `Cannot replace import`);

    if (typeof buildFnOrInstance === 'function') {
      return new ModulePatch(
        this.moduleId,
        this.registry,
        this.patchedResolvers.extend(name, {
          id: prev.id,
          type: 'resolver',
          resolverThunk: buildStrategy(buildFnOrInstance),
        }) as any,
      );
    }

    return new ModulePatch(
      this.moduleId,
      this.registry,
      this.patchedResolvers.extend(name, {
        id: prev.id,
        type: 'resolver',
        resolverThunk: buildFnOrInstance,
      }) as any,
    );
  }

  apply<TKey extends ModuleRecord.InstancesKeys<TRecord>, TValue extends BuildStrategy.Unbox<TRecord[TKey]>>(
    name: TKey,
    applyFn: (instance: TValue) => any,
  ): ModulePatch<TRecord & Record<TKey, BuildStrategy<TValue>>> {
    const definition = this.patchedResolvers.get(name) || this.registry.get(name);

    invariant(isInstanceDefinition(definition), `Cannot decorate module import`);

    const { id, resolverThunk } = definition;

    const decorated = {
      id,
      type: 'resolver',
      resolverThunk: new ApplyStrategy(resolverThunk as any, applyFn),
    };

    const replaced = this.patchedResolvers.extendOrSet(name, decorated);
    return new ModulePatch(this.moduleId, this.registry, replaced as any);
  }

  decorate<TKey extends ModuleRecord.InstancesKeys<TRecord>, TValue extends BuildStrategy.Unbox<TRecord[TKey]>>(
    name: TKey,
    decorateFn: (originalValue: TValue, moduleAsObject: ModuleRecord.Materialized<TRecord>) => TValue,
  ): ModulePatch<TRecord & Record<TKey, BuildStrategy<TValue>>> {
    const definition = this.patchedResolvers.get(name) || this.registry.get(name);

    invariant(isInstanceDefinition(definition), `Cannot decorate module import`);

    const { id, resolverThunk } = definition;

    const decorated = {
      id,
      type: 'resolver',
      resolverThunk: new DecoratorStrategy(resolverThunk as any, decorateFn),
    };

    const replaced = this.patchedResolvers.extendOrSet(name, decorated);
    return new ModulePatch(this.moduleId, this.registry, replaced as any);
  }

  merge<TRecord extends Record<string, AnyResolver>>(otherModule: ModulePatch<TRecord>): ModulePatch<TRecord> {
    invariant(
      this.moduleId.revision === otherModule.moduleId.revision,
      `Cannot apply patch from module with different id`,
    );

    return new ModulePatch<TRecord>(
      this.moduleId,
      this.registry,
      this.patchedResolvers.merge(otherModule.patchedResolvers),
    );
  }
}
