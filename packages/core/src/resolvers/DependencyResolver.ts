import { AbstractDependencyResolver } from "./abstract/AbstractDependencyResolver";
import { Module } from "../module/Module";
import { Instance } from "./abstract/Instance";

export type DefinitionResolver = Module<any> | AbstractDependencyResolver<any>;
export type DefinitionResolverFactory = (context: any) => DefinitionResolver;

export namespace DependencyResolver {
  // prettier-ignore
  export type Value<TResolver extends DefinitionResolver> =
    TResolver extends AbstractDependencyResolver<infer TType> ? Instance<TType>  :
    TResolver extends Module<infer TType> ? TType : never;
}
