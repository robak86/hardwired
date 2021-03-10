import { ModuleId } from './ModuleId';
import { ImmutableMap } from '../collections/ImmutableMap';
import invariant from 'tiny-invariant';
import { Thunk } from '../utils/Thunk';
import { AnyResolver, Module, ModuleRecord } from './Module';
import { Instance } from '../resolvers/abstract/Instance';
import { singleton } from '../strategies/SingletonStrategy';
import { getStrategyTag, isStrategyTagged } from '../strategies/utils/strategyTagging';
import { request } from '../strategies/RequestStrategy';

export const module = () => ModuleBuilder.empty();
export const unit = module;

export type IdentifiableModule = { moduleId: ModuleId };
export const buildResolverId = (module: IdentifiableModule, name: string) => `${module.moduleId.id}:${name}`;

export class ModuleBuilder<TRecord extends Record<string, AnyResolver>> {
  static empty(): ModuleBuilder<{}> {
    return new ModuleBuilder<{}>(ModuleId.build(), ImmutableMap.empty() as any, { isFrozen: false });
  }

  protected constructor(
    public moduleId: ModuleId,
    public registry: ImmutableMap<Record<string, Module.Definition>>,
    private isFrozenRef: { isFrozen: boolean },
  ) {}

  isEqual(otherModule: Module<any>): boolean {
    return this.moduleId.revision === otherModule.moduleId.revision;
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
        type: 'module',
        resolverThunk: resolver,
      }),
      this.isFrozenRef,
    );
  }

  // TODO: types allows returning strategy instead of value - add conditional type validation on return type ?
  define<TKey extends string, TValue>(
    name: TKey,
    instance: Instance<TValue>,
  ): ModuleBuilder<TRecord & Record<TKey, Instance<TValue>>>;

  define<TKey extends string, TValue>(
    name: TKey,
    buildFn: (ctx: ModuleRecord.Materialized<TRecord>) => TValue,
    buildStrategy: (resolver: (ctx: ModuleRecord.Materialized<TRecord>) => TValue) => Instance<TValue>,
  ): ModuleBuilder<TRecord & Record<TKey, Instance<TValue>>>;

  define<TKey extends string, TValue>(
    name: TKey,
    buildFnOrInstance: ((ctx: ModuleRecord.Materialized<TRecord>) => TValue) | Instance<TValue>,
    buildStrategy?,
  ): ModuleBuilder<TRecord & Record<TKey, Instance<TValue>>> {
    invariant(!this.isFrozenRef.isFrozen, `Cannot add definitions to frozen module`);

    // TODO: potential gc issue while getting by id

    if (typeof buildFnOrInstance === 'function') {
      invariant(isStrategyTagged(buildStrategy), `Missing strategy for ${buildStrategy}`);

      return new ModuleBuilder(
        ModuleId.next(this.moduleId),
        this.registry.extend(name, {
          id: buildResolverId(this, name),
          type: 'resolver',
          strategyTag: getStrategyTag(buildStrategy),
          resolverThunk: buildStrategy(buildFnOrInstance),
        }) as any,
        this.isFrozenRef,
      );
    }

    if (buildFnOrInstance instanceof Instance) {
      return new ModuleBuilder(
        ModuleId.next(this.moduleId),
        this.registry.extend(name, {
          id: buildResolverId(this, name),
          type: 'resolver',
          strategyTag: getStrategyTag(buildFnOrInstance),
          resolverThunk: buildFnOrInstance,
        }) as any,
        this.isFrozenRef,
      );
    }

    throw new Error('Wrong params');
  }

  build(): Module<TRecord> {
    invariant(!this.isFrozenRef.isFrozen, `Cannot freeze the module. Module is already frozen.`);
    this.isFrozenRef.isFrozen = true;
    return new Module(ModuleId.next(this.moduleId), this.registry) as Module<TRecord>;
  }
}
