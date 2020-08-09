import { AbstractDependencyResolver, AbstractModuleResolver } from '../resolvers/AbstractDependencyResolver';
import { ContainerCache } from '../container/container-cache';
import { RegistryRecord } from '../module/RegistryRecord';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { DependencyResolver } from '../resolvers/DependencyResolver';

export class DummyResolver<TValue> extends AbstractDependencyResolver<TValue> {
  constructor(private value: TValue) {
    super();
  }

  build(cache: ContainerCache): TValue {
    return this.value;
  }
}

export class RegistryResolver<TValue extends RegistryRecord> extends AbstractModuleResolver<TValue> {
  constructor(registry) {
    super(registry);
  }

  build(): [TValue, ModuleRegistry] {
    throw new Error('Implement me');
  }

  forEach(iterFn: (resolver: DependencyResolver<any>) => any) {}
}

export const dependency = <TValue>(value: TValue): DummyResolver<TValue> => {
  return new DummyResolver<TValue>(value);
};

export const registryDependency = <TValue extends RegistryRecord>(value: TValue): RegistryResolver<TValue> => {
  return new RegistryResolver<TValue>(value);
};
