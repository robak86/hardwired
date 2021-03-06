import { ModuleId } from './ModuleId';
import { ImmutableMap } from '../collections/ImmutableMap';
import invariant from 'tiny-invariant';
import { Thunk } from '../utils/Thunk';
import { AnyResolver, Module, ModuleRecord } from './Module';
import { BuildStrategy } from '../resolvers/abstract/BuildStrategy';
import { getStrategyTag, isStrategyTagged } from '../strategies/utils/strategyTagging';

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
    moduleThunk: Thunk<TValue>,
  ): ModuleBuilder<TRecord & Record<TKey, TValue>> {
    invariant(!this.registry.hasKey(name), `Dependency with name: ${name} already exists`);
    invariant(!this.isFrozenRef.isFrozen, `Module is frozen. Cannot import additional modules.`);

    return new ModuleBuilder(
      ModuleId.next(this.moduleId),
      this.registry.extend(name, {
        type: 'module',
        resolverThunk: moduleThunk,
      }),
      this.isFrozenRef,
    );
  }

  // TODO: types allows returning strategy instead of value - add conditional type validation on return type ?

  define<TKey extends string, TValue>(
    name: TKey,
    buildStrategyWrapper: (resolver: (ctx: ModuleRecord.Materialized<TRecord>) => TValue) => BuildStrategy<TValue>,
    buildFn: (ctx: ModuleRecord.Materialized<TRecord>) => TValue,
  ): ModuleBuilder<TRecord & Record<TKey, BuildStrategy<TValue>>>;

  define<TKey extends string, TValue>(
    name: TKey,
    buildStrategy: BuildStrategy<TValue>, //TODO this may be kind of useless/limited, because we cannot pass Materialized ctx into Strategy
  ): ModuleBuilder<TRecord & Record<TKey, BuildStrategy<TValue>>>;

  define<TKey extends string, TValue>(
    name: TKey,
    wrapperOrStrategy:
      | BuildStrategy<TValue>
      | ((resolver: (ctx: ModuleRecord.Materialized<TRecord>) => TValue) => BuildStrategy<TValue>),
    buildFn?: (ctx: ModuleRecord.Materialized<TRecord>) => TValue,
  ): ModuleBuilder<TRecord & Record<TKey, BuildStrategy<TValue>>> {
    invariant(!this.isFrozenRef.isFrozen, `Cannot add definitions to frozen module`);

    if (wrapperOrStrategy instanceof BuildStrategy) {
      return new ModuleBuilder(
        ModuleId.next(this.moduleId),
        this.registry.extend(name, {
          id: buildResolverId(this, name),
          type: 'resolver',
          strategyTag: getStrategyTag(wrapperOrStrategy),
          resolverThunk: wrapperOrStrategy,
        }) as any,
        this.isFrozenRef,
      );
    }

    // TODO: potential gc issue while getting by id

    if (buildFn && typeof wrapperOrStrategy === 'function') {
      invariant(isStrategyTagged(wrapperOrStrategy), `Missing strategy for ${wrapperOrStrategy}`);

      return new ModuleBuilder(
        ModuleId.next(this.moduleId),
        this.registry.extend(name, {
          id: buildResolverId(this, name),
          type: 'resolver',
          strategyTag: getStrategyTag(wrapperOrStrategy),
          resolverThunk: wrapperOrStrategy(buildFn),
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

  freeze = this.build;
}
