import { DefinitionsSet } from '../module/DefinitionsSet';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { ModuleBuilder } from './ModuleBuilder';

export abstract class BaseModuleBuilder<TRegistry extends ModuleRegistry> implements ModuleBuilder<TRegistry> {
  protected constructor(public readonly registry: DefinitionsSet<TRegistry>) {}

  abstract define(...args: any[]): any;
  protected abstract build<TNextBuilder extends this>(ctx): TNextBuilder;

  using<TNextBuilder extends ModuleBuilder<TRegistry>>(
    builderFactory: (ctx: DefinitionsSet<TRegistry>) => TNextBuilder,
  ): TNextBuilder {
    return builderFactory(this.registry);
  }
}
