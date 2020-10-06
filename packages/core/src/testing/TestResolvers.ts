import { AbstractDependencyResolver, AbstractModuleResolver } from '../resolvers/AbstractDependencyResolver';
import { ContainerContext } from '../container/ContainerContext';
import { RegistryRecord } from '../module/RegistryRecord';
import { ModuleLookup } from '../module/ModuleLookup';
import { DependencyResolver } from '../resolvers/DependencyResolver';

export class DummyResolver<TValue> extends AbstractDependencyResolver<TValue> {
  constructor(private value: TValue) {
    super();
  }

  build(cache: ContainerContext): TValue {
    return this.value;
  }
  onInit(lookup: ModuleLookup<any>) {
    return undefined;
  }
}

// export class RegistryResolver<TValue extends RegistryRecord> extends AbstractModuleResolver<TValue> {
//   constructor(registry) {
//     super(registry);
//   }
//
//   build(): ModuleLookup<any> {
//     throw new Error('Implement me');
//   }
//   onInit() {}
//
//   forEach(iterFn: (resolver: any) => any) {}
// }

export const dependency = <TValue>(value: TValue): DummyResolver<TValue> => {
  return new DummyResolver<TValue>(value);
};



export class TestTransientResolver<TReturn> extends AbstractDependencyResolver<TReturn> {
  constructor(private resolver: () => TReturn) {
    super();
  }

  build(cache: ContainerContext): TReturn {
    return this.resolver();
  }
}
