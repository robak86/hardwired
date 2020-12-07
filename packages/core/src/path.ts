import { ModuleBuilder, AnyResolver } from "./module/ModuleBuilder";
import { Module } from "./resolvers/abstract/AbstractResolvers";

/**
 * We cannot use Generic type for getting all possible paths and apply it on materialize module - it generates error
 */
export type AllowedKeys<TRecord extends Record<string, AnyResolver>> = {
  [K in keyof TRecord & string]: TRecord[K] extends Module<infer TChildEntry> ? `${K}.${AllowedKeys<TChildEntry>}` : K;
}[keyof TRecord & string];




