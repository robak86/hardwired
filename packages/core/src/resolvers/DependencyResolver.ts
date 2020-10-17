import { AbstractDependencyResolver } from "./abstract/AbstractDependencyResolver";
import { DependencyFactory } from "../module/RegistryRecord";
import { Module } from "../module/Module";

export type DefinitionResolver = Module<any> | AbstractDependencyResolver<any>;
export type DefinitionResolverFactory = (context: any) => DefinitionResolver;

export namespace DependencyResolver {
  // prettier-ignore
  export type Value<TResolver extends DefinitionResolver> =
    TResolver extends AbstractDependencyResolver<infer TType> ? DependencyFactory<TType>  :
    TResolver extends Module<infer TType> ? TType : never;
}
