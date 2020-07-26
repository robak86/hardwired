import { ModuleRegistry } from './ModuleRegistry';
import { RegistryRecord } from './RegistryRecord';
import { BaseModuleBuilder } from '../builders/BaseModuleBuilder';

declare namespace Module {

}

export class Module<TRegistryRecord extends RegistryRecord> extends BaseModuleBuilder<TRegistryRecord> {
  constructor(registry: ModuleRegistry<TRegistryRecord>) {
    super(registry);
  }
}

export function module<CTX = {}>(name: string) {
  return new Module<{}>(ModuleRegistry.empty(name));
}

export const unit = module;
