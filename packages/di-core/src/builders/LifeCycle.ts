import { MaterializedModuleEntries, RegistryRecord } from '../module/RegistryRecord';
import { BaseModuleBuilder } from './BaseModuleBuilder';
import { ModuleRegistry } from '../module/ModuleRegistry';

export class LifeCycle<TRegistryRecord extends RegistryRecord> extends BaseModuleBuilder<TRegistryRecord> {
  constructor(registry: ModuleRegistry<TRegistryRecord>) {
    super(registry);
  }

  onInit(
    // key: TKey,
    initFn: (container: MaterializedModuleEntries<TRegistryRecord>) => void,
  ): this {
    return this.build(this.registry.appendInitializer('_____module', initFn));
  }
}

export const lifecycle = () => <TRegistryRecord extends RegistryRecord>(
  registry: ModuleRegistry<TRegistryRecord>,
): LifeCycle<TRegistryRecord> => new LifeCycle(registry);
