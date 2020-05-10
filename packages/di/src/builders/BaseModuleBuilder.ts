import { DefinitionsSet } from '../module/DefinitionsSet';
import {
  MaterializedDefinitions,
  MaterializedModuleEntries,
  ModuleRegistry,
  ModuleRegistryDefinitionsKeys,
  ModuleRegistryImportsKeys,
} from '../module/ModuleRegistry';
import { ModuleBuilder } from './ModuleBuilder';
import { FilterPrivateFields } from '../module/ModuleUtils';

export abstract class BaseModuleBuilder<TRegistry extends ModuleRegistry> implements ModuleBuilder<TRegistry> {
  protected constructor(public readonly registry: DefinitionsSet<TRegistry>) {}

  // abstract define(...args: any[]): any;

  // Maybe imports should be realized by separate builder ?
  // abstract import(...args: any[]): any;

  protected abstract build<TNextBuilder extends this>(ctx): TNextBuilder;

  using<TNextBuilder extends ModuleBuilder<TRegistry>>(
    builderFactory: (ctx: DefinitionsSet<TRegistry>) => TNextBuilder,
  ): TNextBuilder {
    return builderFactory(this.registry);
  }

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
    factory: (container: MaterializedModuleEntries<TRegistry>, C) => FilterPrivateFields<MaterializedDefinitions<TRegistry>[K]>,
  ): this {
    throw new Error('implement me');
    // return this.undeclare(key).define(key as any, factory as any) as any;
  }
}
