import { ModuleRegistry } from '../module/ModuleRegistry';
import { transient } from '../resolvers/TransientResolver';
import { ComposeDependencyResolvers } from './ModuleBuilderCompose';
import { importModule } from '../resolvers/ImportResolver';
import { ModuleId } from '../../../di-core/src/module-id';
import { DependencyResolver } from '../resolvers/DependencyResolver';

export class ModuleBuilder<TRegistryRecord> {
  static empty(name: string): ModuleBuilder<{}> {
    return new ModuleBuilder<{}>(ModuleId.build(name), ModuleRegistry.empty(name));
  }

  protected constructor(
    public moduleId: ModuleId,
    readonly registry: ModuleRegistry<{ [K in keyof TRegistryRecord]: DependencyResolver<any, TRegistryRecord[K]> }>,
  ) {}

  append: ComposeDependencyResolvers<TRegistryRecord> = (...resolvers: DependencyResolver<any, any>[]) => {
    throw new Error('Implement me');
  };

  toObject(): TRegistryRecord {
    throw new Error('DO NOT IMPLEMENT ME');
  }
}

export type ModuleBuilderRegistry<T> = T extends ModuleBuilder<infer TRegistryRecord> ? TRegistryRecord : never;

const mod = ModuleBuilder.empty('someModule')
  .append(
    _ => transient('a', () => 1),
    _ => transient('b', () => true),
    _ => transient('c', () => 'sdf'),
  )
  .append(
    _ => transient('aa', () => 1),
    _ => transient('ba', () => true),
    // _ => transient('ca', () => _.z),
  );

const mod2 = ModuleBuilder.empty('someOtherModule')
  .append(
    _ => importModule('imported', mod),
    _ => importModule('imported2', mod),
  )
  .toObject();

const mod2: any = null as any;

// const zz = mod(_ => ['name', transient(() => 1)]);
