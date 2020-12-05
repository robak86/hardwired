import { M, ModuleEntry } from './new-api';

export type PropType<T, Path extends string> = string extends Path
  ? unknown
  : Path extends keyof T
  ? T[Path]
  : Path extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? PropType<T[K], R>
    : unknown
  : unknown;

export type AllowedKeys<TRecord extends Record<string, ModuleEntry>> = {
  [K in keyof TRecord & string]: TRecord[K] extends M<infer TChildEntry> ? `${K}.${AllowedKeys<TChildEntry>}` : K;
}[keyof TRecord & string];
