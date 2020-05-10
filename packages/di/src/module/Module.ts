import { DefinitionsSet } from './DefinitionsSet';
import { ModuleRegistry } from './ModuleRegistry';
import { BaseModuleBuilder } from '../builders/BaseModuleBuilder';
import { ModuleBuilder } from '../builders/ModuleBuilder';

export class Module<R extends ModuleRegistry> extends BaseModuleBuilder<R> {
  constructor(registry: DefinitionsSet<R>) {
    super(registry);
  }

  protected build<TNextBuilder extends this>(ctx: any): TNextBuilder {
    return new Module(ctx) as any;
  }
}

export function module<CTX = {}>(name: string): Module<{}> {
  return new Module(DefinitionsSet.empty(name));
}
