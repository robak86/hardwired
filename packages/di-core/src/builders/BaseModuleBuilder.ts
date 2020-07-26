import { DefinitionsSet } from '../module/DefinitionsSet';
import {
  Definition,
  MaterializedDefinitions,
  MaterializedModuleEntries,
  ModuleRegistry,
  ModuleRegistryDefinitionsKeys,
  ModuleRegistryImportsKeys,
} from '../module/ModuleRegistry';
import { ModuleBuilder } from './ModuleBuilder';
import { ClassType, FilterPrivateFields, NotDuplicated } from '../module/ModuleUtils';
import { TransientResolver } from '../resolvers/TransientResolver';

import { DependencyResolver } from '../resolvers/DependencyResolver';

export type NextBaseModuleBuilder<TKey extends string, TReturn, TRegistry extends ModuleRegistry> = NotDuplicated<
  TKey,
  TRegistry,
  BaseModuleBuilder<TRegistry & { [K in TKey]: Definition<TReturn> }>
>;

export abstract class BaseModuleBuilder<TRegistry extends ModuleRegistry> implements ModuleBuilder<TRegistry> {
  protected constructor(public readonly registry: DefinitionsSet<TRegistry>) {}

  protected build<TNextModule extends this>(ctx: DefinitionsSet<any>): this {
    const Cls = this.constructor as new (registry: DefinitionsSet<TRegistry>) => this;
    return new Cls(ctx);
  }

  using<TNextBuilder>(builderFactory: (ctx: DefinitionsSet<TRegistry>) => TNextBuilder): TNextBuilder {
    return builderFactory(this.registry);
  }

  define<K extends string, V>(
    key: K,
    factory: (ctx: MaterializedModuleEntries<TRegistry>) => V,
  ): NextBaseModuleBuilder<K, V, TRegistry>;
  define<K extends string, V>(
    key: K,
    resolver: DependencyResolver<TRegistry, V>,
  ): NextBaseModuleBuilder<K, V, TRegistry>;
  define<K extends string, V>(key: K, resolverOrFactory: any): NextBaseModuleBuilder<K, V, TRegistry> {
    if (typeof resolverOrFactory === 'function') {
      return this.registry.extendDeclarations(key, new TransientResolver(resolverOrFactory));
    }

    return this.registry.extendDeclarations(key, resolverOrFactory);
  }

  // define<TNextBuilder, TOutput extends BaseModuleBuilder<any>>(
  //   builderFactory: (ctx: DefinitionsSet<TRegistry>) => TNextBuilder,
  //   builder: (m: TNextBuilder) => TOutput,
  // ): TOutput {
  //   return builderFactory(this.registry) as any;
  // }

  // TODO: use Flatten to make this method type safe
  inject<TNextR extends ModuleRegistry>(otherModule: ModuleBuilder<TNextR>): this {
    return this.build(this.registry.inject(otherModule.registry));
  }

  hasModule(key: ModuleRegistryImportsKeys<TRegistry>): boolean {
    return this.registry.hasImport(key); // TODO: hacky - because we cannot be sure that this key is a module and not a import
  }

  isDeclared(key: ModuleRegistryDefinitionsKeys<TRegistry>): boolean {
    return this.registry.hasDeclaration(key);
  }

  replace<K extends ModuleRegistryDefinitionsKeys<TRegistry>, C>(
    key: K,
    factory: (
      container: MaterializedModuleEntries<TRegistry>,
      C,
    ) => FilterPrivateFields<MaterializedDefinitions<TRegistry>[K]>,
  ): this {
    const newRegistry = this.registry.extendDeclarations(key as any, new TransientResolver(factory as any));
    return this.build(newRegistry) as any;
  }

  enhance<TNextBuilder extends ModuleBuilder<TRegistry>>(
    builderFactory: (ctx: DefinitionsSet<TRegistry>) => TNextBuilder,
  ): this & TNextBuilder {
    throw new Error('implement me');
  }

  applyTrait<TNextBuilder extends ModuleBuilder<TRegistry>>(
    builderFactory: ClassType<any, TNextBuilder>,
  ): this & TNextBuilder {
    throw new Error('implement me');
  }

  // applyTrait<TNextBuilder extends ModuleBuilder<TRegistry>>(
  //   builderFactory: (ctx: DefinitionsSet<TRegistry>) => TNextBuilder,
  // ): this & TNextBuilder {
  //   throw new Error('implement me');
  // }
}
