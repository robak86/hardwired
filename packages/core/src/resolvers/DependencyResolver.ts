import { AbstractDependencyResolver, AbstractModuleResolver } from './AbstractDependencyResolver';
import { DependencyFactory, RegistryRecord } from '../module/RegistryRecord';
import { Module } from '../module/Module';

// prettier-ignore
// export type DependencyResolver<TValue> =
//   | AbstractDependencyResolver<any>
//   | AbstractModuleResolver<any>;

export type ModuleDefinition = Module<any> | AbstractDependencyResolver<any>

export namespace DependencyResolver {
  // prettier-ignore
  export type Value<TResolver extends ModuleDefinition> =
    TResolver extends AbstractDependencyResolver<infer TType> ? DependencyFactory<TType>  :
    TResolver extends Module<infer TType> ? TType : never;
}
