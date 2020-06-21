import { ModuleRegistry } from '../module/ModuleRegistry';
import { DefinitionsSet } from '../module/DefinitionsSet';

export interface ModuleBuilder<TRegistry extends ModuleRegistry> {
  readonly registry: DefinitionsSet<TRegistry>;
  using<TNextBuilder>(builderFactory: (ctx: DefinitionsSet<TRegistry>) => TNextBuilder): TNextBuilder;

  enhance<TNextBuilder extends ModuleBuilder<TRegistry>>(
    builderFactory: (ctx: DefinitionsSet<TRegistry>) => TNextBuilder,
  ): this & TNextBuilder;
}

export type ModuleBuilderRegistry<T> = T extends ModuleBuilder<infer TRegistry> ? TRegistry : never;
