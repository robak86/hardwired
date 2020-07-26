import { ModuleRegistry } from '../module/ModuleRegistry';
import {
  Definition,
  MaterializedDefinitions,
  MaterializedModuleEntries,
  RegistryRecord,
  ModuleRegistryDefinitionsKeys,
  ModuleRegistryImportsKeys,
} from '../module/RegistryRecord';
import { ModuleBuilder } from './ModuleBuilder';
import { ClassType, FilterPrivateFields, NotDuplicated } from '../module/ModuleUtils';
import { TransientResolver } from '../resolvers/TransientResolver';

import { DependencyResolver } from '../resolvers/DependencyResolver';

export type NextBaseModuleBuilder<TKey extends string, TReturn, TRegistryRecord extends RegistryRecord> = NotDuplicated<
  TKey,
  TRegistryRecord,
  BaseModuleBuilder<TRegistryRecord & { [K in TKey]: Definition<TReturn> }>
>;

export abstract class BaseModuleBuilder<TRegistryRecord extends RegistryRecord> implements ModuleBuilder<TRegistryRecord> {
  protected constructor(public readonly registry: ModuleRegistry<TRegistryRecord>) {}

  protected build<TNextModule extends this>(ctx: ModuleRegistry<any>): this {
    const Cls = this.constructor as new (registry: ModuleRegistry<TRegistryRecord>) => this;
    return new Cls(ctx);
  }

  using<TNextBuilder>(builderFactory: (ctx: ModuleRegistry<TRegistryRecord>) => TNextBuilder): TNextBuilder {
    return builderFactory(this.registry);
  }

  define<K extends string, V>(
    key: K,
    factory: (ctx: MaterializedModuleEntries<TRegistryRecord>) => V,
  ): NextBaseModuleBuilder<K, V, TRegistryRecord>;
  define<K extends string, V>(
    key: K,
    resolver: DependencyResolver<TRegistryRecord, V>,
  ): NextBaseModuleBuilder<K, V, TRegistryRecord>;
  define<K extends string, V>(key: K, resolverOrFactory: any): NextBaseModuleBuilder<K, V, TRegistryRecord> {
    if (typeof resolverOrFactory === 'function') {
      return this.registry.extendDeclarations(key, new TransientResolver(resolverOrFactory));
    }

    return this.registry.extendDeclarations(key, resolverOrFactory);
  }

  // define<TNextBuilder, TOutput extends BaseModuleBuilder<any>>(
  //   builderFactory: (ctx: ModuleRegistry<TRegistryRecord>) => TNextBuilder,
  //   builder: (m: TNextBuilder) => TOutput,
  // ): TOutput {
  //   return builderFactory(this.registry) as any;
  // }

  // TODO: use Flatten to make this method type safe
  inject<TNextR extends RegistryRecord>(otherModule: ModuleBuilder<TNextR>): this {
    return this.build(this.registry.inject(otherModule.registry));
  }

  hasModule(key: ModuleRegistryImportsKeys<TRegistryRecord>): boolean {
    return this.registry.hasImport(key); // TODO: hacky - because we cannot be sure that this key is a module and not a import
  }

  isDeclared(key: ModuleRegistryDefinitionsKeys<TRegistryRecord>): boolean {
    return this.registry.hasDeclaration(key);
  }

  replace<K extends ModuleRegistryDefinitionsKeys<TRegistryRecord>, C>(
    key: K,
    factory: (
      container: MaterializedModuleEntries<TRegistryRecord>,
      C,
    ) => FilterPrivateFields<MaterializedDefinitions<TRegistryRecord>[K]>,
  ): this {
    const newRegistry = this.registry.extendDeclarations(key as any, new TransientResolver(factory as any));
    return this.build(newRegistry) as any;
  }

  enhance<TNextBuilder extends ModuleBuilder<TRegistryRecord>>(
    builderFactory: (ctx: ModuleRegistry<TRegistryRecord>) => TNextBuilder,
  ): this & TNextBuilder {
    throw new Error('implement me');
  }

  applyTrait<TNextBuilder extends ModuleBuilder<TRegistryRecord>>(
    builderFactory: ClassType<any, TNextBuilder>,
  ): this & TNextBuilder {
    throw new Error('implement me');
  }

  // applyTrait<TNextBuilder extends ModuleBuilder<TRegistryRecord>>(
  //   builderFactory: (ctx: ModuleRegistry<TRegistryRecord>) => TNextBuilder,
  // ): this & TNextBuilder {
  //   throw new Error('implement me');
  // }
}
