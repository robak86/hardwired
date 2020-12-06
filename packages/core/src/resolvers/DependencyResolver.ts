import { AbstractDependencyResolver } from "./abstract/AbstractDependencyResolver";
import { ModuleBuilder } from "../module/ModuleBuilder";
import { InstanceLegacy } from "./abstract/InstanceLegacy";

export type DefinitionResolver = ModuleBuilder<any> | AbstractDependencyResolver<any>;
export type DefinitionResolverFactory = (context: any) => DefinitionResolver;

export namespace DependencyResolver {
  // prettier-ignore
  export type Value<TResolver extends DefinitionResolver> =
    TResolver extends AbstractDependencyResolver<infer TType> ? InstanceLegacy<TType>  :
    TResolver extends ModuleBuilder<infer TType> ? TType : never;
}
