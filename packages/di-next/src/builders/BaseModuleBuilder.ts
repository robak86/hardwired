import { ModuleRegistry } from '../module/ModuleRegistry';
import { Definition, RegistryRecord, } from '../module/RegistryRecord';
import { ModuleBuilder } from './ModuleBuilder';
import { FilterPrivateFields, NotDuplicated } from '../module/ModuleUtils';

import { DependencyResolver } from '../resolvers/DependencyResolver';

export type NextBaseModuleBuilder<TKey extends string, TReturn, TRegistryRecord extends RegistryRecord> = NotDuplicated<
  TKey,
  TRegistryRecord,
  BaseModuleBuilder<TRegistryRecord & { [K in TKey]: Definition<TReturn> }>
>;

export class BaseModuleBuilder<TRegistryRecord> {
  protected constructor(public readonly registry: ModuleRegistry<any>) {}

  protected build<TNextModule extends this>(ctx: ModuleRegistry<any>): this {
    const Cls = this.constructor as new (registry: ModuleRegistry<any>) => this;
    return new Cls(ctx);
  }

  define<K extends string, V>(key: K, factory: (ctx: TRegistryRecord) => V): NextBaseModuleBuilder<K, V, any>;
  define<K extends string, V>(key: K, resolver: DependencyResolver<any, V>): NextBaseModuleBuilder<K, V, any>;
  define<K extends string, V>(key: K, resolverOrFactory: any): NextBaseModuleBuilder<K, V, any> {
    throw new Error('IUmplement me');

    // if (typeof resolverOrFactory === 'function') {
    //   return this.registry.extendDeclarations(key, new TransientResolver(resolverOrFactory));
    // }
    //
    // return this.registry.extendDeclarations(key, resolverOrFactory);
  }

  // define<TNextBuilder, TOutput extends BaseModuleBuilder<any>>(
  //   builderFactory: (ctx: ModuleRegistry<TRegistryRecord>) => TNextBuilder,
  //   builder: (m: TNextBuilder) => TOutput,
  // ): TOutput {
  //   return builderFactory(this.registry) as any;
  // }

  // TODO: use Flatten to make this method type safe
  inject<TNextR extends RegistryRecord>(otherModule: ModuleBuilder<TNextR>): this {
    throw new Error('Implement me');
    // return this.build(this.registry.inject(otherModule.registry));
  }

  replace<K extends keyof TRegistryRecord, C>(
    key: K,
    factory: (container: TRegistryRecord, C) => FilterPrivateFields<TRegistryRecord[K]>,
  ): this {
    throw new Error('IUmplement me');
    // const newRegistry = this.registry.replace(key as any, new TransientResolver(factory as any));
    // return this.build(newRegistry) as any;
  }
}
