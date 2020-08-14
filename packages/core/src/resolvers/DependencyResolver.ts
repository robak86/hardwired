import { AbstractDependencyResolver, AbstractModuleResolver } from './AbstractDependencyResolver';
import { DependencyFactory } from "../module/RegistryRecord";

// prettier-ignore
export type DependencyResolver<TValue> =
  | AbstractDependencyResolver<any>
  | AbstractModuleResolver<any>;

export namespace DependencyResolver {

  // prettier-ignore
  export type Value<TResolver extends DependencyResolver<any>> =
    TResolver extends AbstractDependencyResolver<infer TType> ? DependencyFactory<TType>  :
    TResolver extends AbstractModuleResolver<infer TType> ? TType : never;
}
