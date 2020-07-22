import { DefinitionsSet } from './DefinitionsSet';
import { ModuleRegistry } from './ModuleRegistry';
import { BaseModuleBuilder } from '../builders/BaseModuleBuilder';

export class Module<TRegistry extends ModuleRegistry> extends BaseModuleBuilder<TRegistry> {
  constructor(registry: DefinitionsSet<TRegistry>) {
    super(registry);
  }
}

export function module<CTX = {}>(name: string) {
  return new Module<{}>(DefinitionsSet.empty(name));
}

export const unit = module;
