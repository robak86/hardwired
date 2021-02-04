import { ModuleId } from './ModuleId';
import { ImmutableMap } from '../collections/ImmutableMap';
import invariant from 'tiny-invariant';
import { Thunk, unwrapThunk } from '../utils/Thunk';
import { AnyResolver, Module, ModuleRecord } from '../resolvers/abstract/Module';
import { Instance } from '../resolvers/abstract/Instance';
import { BuildStrategy } from '../strategies/abstract/BuildStrategy';
import { singleton } from '../strategies/SingletonStrategy';

export const module = () => ModuleBuilder.empty();
export const unit = module;

function buildResolverId(module: ModuleBuilder<any>, name: string): string {
  return `${module.moduleId.id}:${name}`; // TODO: potential gc issue
}

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
        type: 'module',
        resolverThunk: resolver,
      }),
      this.isFrozenRef,
    );
  }

  define<TKey extends string, TInstance extends Instance<any>>(
    name: TKey,
    instance: TInstance | ((ctx: ModuleRecord.Materialized<TRecord>) => TInstance),
  ): ModuleBuilder<TRecord & Record<TKey, TInstance>>;

  define<TKey extends string, TValue>(
    name: TKey,
    buildFn: (ctx: ModuleRecord.Materialized<TRecord>) => TValue,
    buildStrategy?: (resolver: (ctx: ModuleRecord.Materialized<TRecord>) => TValue) => BuildStrategy<TValue>,
  ): ModuleBuilder<TRecord & Record<TKey, Instance<TValue>>>;

  define<TKey extends string, TValue>(
    name: TKey,
    buildFnOrInstance: ((ctx: ModuleRecord.Materialized<TRecord>) => TValue) | Instance<TValue>,
    buildStrategy = singleton,
  ): ModuleBuilder<TRecord & Record<TKey, Instance<TValue>>> {
    invariant(!this.isFrozenRef.isFrozen, `Cannot add definitions to frozen module`);

    if (typeof buildFnOrInstance === 'function') {
      return new ModuleBuilder(
        ModuleId.next(this.moduleId),
        this.registry.extend(name, {
          id: buildResolverId(this, name),
          type: 'resolver' as const,
          resolverThunk: buildStrategy(buildFnOrInstance) as any,
        }) as any,
        this.isFrozenRef,
      );
    }

    return new ModuleBuilder(
      ModuleId.next(this.moduleId),
      this.registry.extend(name, {
        id: buildResolverId(this, name),
        type: 'resolver' as const,
        resolverThunk: buildFnOrInstance as any,
      }) as any,
      this.isFrozenRef,
    );
  }

  build(): Module<TRecord> {
    invariant(!this.isFrozenRef.isFrozen, `Cannot freeze the module. Module is already frozen.`);
    this.isFrozenRef.isFrozen = true;
    return new Module(ModuleId.next(this.moduleId), this.registry) as Module<TRecord>;
  }
}
