import { DefinitionsSet } from './DefinitionsSet';
import { ModuleRegistry, RequiresDefinition } from './ModuleRegistry';
import { NotDuplicatedKeys } from './ModuleUtils';
import { BaseModuleBuilder } from '../builders/BaseModuleBuilder';

export class Module<R extends ModuleRegistry> extends BaseModuleBuilder<R> {
  constructor(registry: DefinitionsSet<R>) {
    super(registry);
  }

  protected build<TNextBuilder extends this>(ctx: any): TNextBuilder {
    return new Module(ctx) as any;
  }

  require<TNextContext extends object>(): NotDuplicatedKeys<
    R,
    TNextContext,
    Module<R & { [K in keyof TNextContext]: RequiresDefinition<TNextContext[K]> }>
  > {
    return this as any;
  }
}

export function module<CTX = {}>(name: string): Module<{}> {
  return new Module(DefinitionsSet.empty(name));
}
