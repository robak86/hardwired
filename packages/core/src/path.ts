import { ModuleBuilder, ModuleEntry } from "./module/ModuleBuilder";

/**
 * We cannot use Generic type for getting all possible paths and apply it on materialize module - it generates error
 */
export type AllowedKeys<TRecord extends Record<string, ModuleEntry>> = {
  [K in keyof TRecord & string]: TRecord[K] extends ModuleBuilder<infer TChildEntry> ? `${K}.${AllowedKeys<TChildEntry>}` : K;
}[keyof TRecord & string];




