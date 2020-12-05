import { Module, ModuleEntry } from "./new-api";

export type AllowedKeys<TRecord extends Record<string, ModuleEntry>> = {
  [K in keyof TRecord & string]: TRecord[K] extends Module<infer TChildEntry> ? `${K}.${AllowedKeys<TChildEntry>}` : K;
}[keyof TRecord & string];
