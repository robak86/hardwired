import { ModuleId } from './ModuleId';
import { ImmutableSet } from '../collections/ImmutableSet';
import invariant from 'tiny-invariant';
import { Thunk } from '../utils/Thunk';
import { AnyResolver, MaterializedRecord, Module, PropTypesTuple } from '../resolvers/abstract/Module';
import { Instance } from '../resolvers/abstract/Instance';
import { LiteralResolver, LiteralResolverDefinition } from '../resolvers/LiteralResolver';

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

    //TODO: should we autofreeze a module here ? and throw next time module is imported but it's extended with additional definitions ?

    return new ModuleBuilder(
      ModuleId.next(this.moduleId),
      this.registry.extend(name, {
        resolverThunk: resolver,
        dependencies: [],
      }) as any,
    );
  }

  // TODO: is it necessary to return Instance with TDeps?  TDeps are not necessary after the instance is registered
  define<TKey extends string, TValue>(
    name: TKey,
    resolver: LiteralResolverDefinition<MaterializedRecord<TRecord>, TValue>,
  ): ModuleBuilder<TRecord & Record<TKey, Instance<TValue, []>>>;
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
    resolver:
      | Instance<TValue, []>
      | Instance<TValue, PropTypesTuple<TDepsKeys, MaterializedRecord<TRecord>>>
      | LiteralResolverDefinition<MaterializedRecord<TRecord>, TValue>,
    dependencies?: TDepsKeys,
  ): unknown {
    invariant(!this.registry.hasKey(name), `Dependency with name: ${name} already exists`);

    const targetResolver =
      resolver.kind === 'literalResolverBuildFn' ? new LiteralResolver(resolver.buildInstance) : resolver;

    return new ModuleBuilder(
      ModuleId.next(this.moduleId),
      this.registry.extend(name, {
        resolverThunk: targetResolver,
        dependencies: dependencies || [],
      }) as any,
    ) as any;
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
