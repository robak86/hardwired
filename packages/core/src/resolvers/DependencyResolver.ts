import { AbstractDependencyResolver, AbstractModuleResolver } from './AbstractDependencyResolver';
import { DependencyFactory, RegistryRecord } from '../module/RegistryRecord';
import { Module } from '../module/Module';

// prettier-ignore
// export type DependencyResolver<TValue> =
//   | AbstractDependencyResolver<any>
//   | AbstractModuleResolver<any>;

export type DefinitionResolver = AbstractModuleResolver<any> | AbstractDependencyResolver<any>
export type DefinitionResolverFactory = (context: any) => DefinitionResolver;

export namespace DependencyResolver {
  // prettier-ignore
  export type Value<TResolver extends DefinitionResolver> =
    TResolver extends AbstractDependencyResolver<infer TType> ? DependencyFactory<TType>  :
    TResolver extends AbstractModuleResolver<infer TType> ? TType : never;
}
