import { ModuleRegistry, RequiresDefinition } from '../module/ModuleRegistry';
import { BaseModuleBuilder } from './BaseModuleBuilder';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { NotDuplicatedKeys } from '../module/ModuleUtils';

export class RequireBuilder<TRegistry extends ModuleRegistry> extends BaseModuleBuilder<TRegistry> {
  constructor(registry: DefinitionsSet<TRegistry>) {
    super(registry);
  }

  require<TNextContext extends object>(): NotDuplicatedKeys<
    TRegistry,
    TNextContext,
    RequireBuilder<TRegistry & { [K in keyof TNextContext]: RequiresDefinition<TNextContext[K]> }>
  > {
    return this as any;
  }

  protected build(ctx) {
    return new RequireBuilder(ctx) as any;
  }
}

export const external = <TRegistry extends ModuleRegistry>(
  registry: DefinitionsSet<TRegistry>,
): RequireBuilder<TRegistry> => new RequireBuilder(registry);
