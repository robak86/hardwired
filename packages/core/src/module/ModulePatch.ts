import { ModuleId } from './ModuleId';
import { ImmutableMap } from '../collections/ImmutableMap';
import { Instance } from '../resolvers/abstract/Instance';
import { BuildStrategy } from '../strategies/abstract/BuildStrategy';
import invariant from 'tiny-invariant';
import { DecoratorResolver } from '../resolvers/DecoratorResolver';
import { AnyResolver, isInstanceDefinition, Module, ModuleRecord } from './Module';
import { getStrategyTag, isStrategyTagged } from '../strategies/utils/strategyTagging';

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
    public registry: ImmutableMap<Record<string, Module.Definition>>,
    public patchedResolvers: ImmutableMap<Record<string, Module.InstanceDefinition>>, //TODO: maybe we should apply patches directly to this.registry ?
  ) {}

  isEqual(otherModule: ModulePatch<any>): boolean {
    return this.moduleId.revision === otherModule.moduleId.revision;
  }

  replace<TKey extends ModuleRecord.InstancesKeys<TRecord>, TValue extends Instance.Unbox<TRecord[TKey]>>(
    name: TKey,
    strategy: (resolver: (ctx: Omit<ModuleRecord.Materialized<TRecord>, TKey>) => TValue) => BuildStrategy<TValue>,
    buildFn: (ctx: Omit<ModuleRecord.Materialized<TRecord>, TKey>) => TValue,
  ): ModulePatch<TRecord>;

  replace<TKey extends ModuleRecord.InstancesKeys<TRecord>, TValue extends Instance.Unbox<TRecord[TKey]>>(
    name: TKey,
    instance: Instance<TValue>,
  ): ModulePatch<TRecord>;

  replace<TKey extends ModuleRecord.InstancesKeys<TRecord>, TValue extends Instance.Unbox<TRecord[TKey]>>(
    name: TKey,
    instanceOrStrategy:
      | Instance<TValue>
      | ((resolver: (ctx: Omit<ModuleRecord.Materialized<TRecord>, TKey>) => TValue) => BuildStrategy<TValue>),
    buildFn?: (ctx: Omit<ModuleRecord.Materialized<TRecord>, TKey>) => TValue,
  ): ModulePatch<TRecord> {
    invariant(
      !this.patchedResolvers.hasKey(name),
      `Cannot replace definition. Patch already contains replaced definition`,
    );

    invariant(this.registry.hasKey(name), `Cannot replace definition: ${name} does not exist.`);
    const prev = this.registry.get(name);
    invariant(prev?.type === 'resolver', `Cannot replace import`);

    if (buildFn && typeof instanceOrStrategy === 'function') {
      return new ModulePatch(
        this.moduleId,
        this.registry,
        this.patchedResolvers.extend(name, {
          id: prev.id,
          type: 'resolver',
          strategyTag: isStrategyTagged(instanceOrStrategy) ? getStrategyTag(instanceOrStrategy) : undefined,
          resolverThunk: instanceOrStrategy(buildFn),
        }) as any,
      );
    }

    if (instanceOrStrategy instanceof Instance) {
      return new ModulePatch(
        this.moduleId,
        this.registry,
        this.patchedResolvers.extend(name, {
          id: prev.id,
          type: 'resolver',
          strategyTag: isStrategyTagged(instanceOrStrategy) ? getStrategyTag(instanceOrStrategy) : undefined,
          resolverThunk: instanceOrStrategy,
        }) as any,
      );
    }

    throw new Error('Wrong params');
  }

  decorate<TKey extends ModuleRecord.InstancesKeys<TRecord>, TValue extends Instance.Unbox<TRecord[TKey]>>(
    name: TKey,
    decorateFn: (originalValue: TValue, moduleAsObject: ModuleRecord.Materialized<TRecord>) => TValue,
  ): ModulePatch<TRecord & Record<TKey, Instance<TValue>>> {
    const definition = this.patchedResolvers.get(name) || this.registry.get(name);

    invariant(isInstanceDefinition(definition), `Cannot decorate module import`);

    const { id, resolverThunk } = definition;

    const decorated = {
      id,
      type: 'resolver',
      resolverThunk: new DecoratorResolver(resolverThunk as any, decorateFn),
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
