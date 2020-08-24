import { AbstractDependencyResolver, AbstractModuleResolver } from '../resolvers/AbstractDependencyResolver';
import { ContainerContext } from '../container/ContainerContext';
import { RegistryRecord } from '../module/RegistryRecord';
import { RegistryLookup } from '../module/RegistryLookup';
import { DependencyResolver } from '../resolvers/DependencyResolver';

export class DummyResolver<TValue> extends AbstractDependencyResolver<TValue> {
  constructor(private value: TValue) {
    super();
  }

  build(cache: ContainerContext): TValue {
    return this.value;
  }
}

export class RegistryResolver<TValue extends RegistryRecord> extends AbstractModuleResolver<TValue> {
  constructor(registry) {
    super(registry);
  }

  build(): [TValue, RegistryLookup] {
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

export class TestTransientResolver<TReturn> extends AbstractDependencyResolver<TReturn> {
  constructor(private resolver: () => TReturn) {
    super();
  }

  build(cache: ContainerContext): TReturn {
    return this.resolver();
  }
}
