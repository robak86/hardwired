import { ModuleRegistry } from '..';
import { DefinitionsSet } from '../module/DefinitionsSet';

export interface ModuleBuilder<TRegistry extends ModuleRegistry> {
  readonly registry: DefinitionsSet<TRegistry>;
  using<TNextBuilder extends ModuleBuilder<TRegistry>>(
    builderFactory: (ctx: DefinitionsSet<TRegistry>) => TNextBuilder,
  ): TNextBuilder;

  // define(...args: any[]): any;
}
