import { RegistryRecord } from '../module/RegistryRecord';
import { ModuleRegistry } from '../module/ModuleRegistry';

export interface ModuleBuilder<TRegistryRecord extends RegistryRecord> {
  readonly registry: ModuleRegistry<TRegistryRecord>;
  using<TNextBuilder>(builderFactory: (ctx: ModuleRegistry<TRegistryRecord>) => TNextBuilder): TNextBuilder;

  enhance<TNextBuilder extends ModuleBuilder<TRegistryRecord>>(
    builderFactory: (ctx: ModuleRegistry<TRegistryRecord>) => TNextBuilder,
  ): this & TNextBuilder;
}

export type ModuleBuilderRegistry<T> = T extends ModuleBuilder<infer TRegistryRecord> ? TRegistryRecord : never;
