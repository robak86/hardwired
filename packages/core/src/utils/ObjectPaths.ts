import { AnyResolver, Module } from '../module/Module';
import { BuildStrategy } from '../strategies/abstract/BuildStrategy';

// prettier-ignore
export type ObjectPaths<TRecord extends Record<string, AnyResolver>> = {
  [K in keyof TRecord & string]:
        TRecord[K] extends BuildStrategy<any> ? K :
        TRecord[K] extends Module<infer TModuleRecord> ? `${K}.${ObjectPathsL2<TModuleRecord>}` :
      never;
}[keyof TRecord & string];

// Using hardcoded second level paths to break recursion in order to limit available paths to closest collaborators
export type ObjectPathsL2<TRecord extends Record<string, AnyResolver>> = {
  [K in keyof TRecord & string]: TRecord[K] extends BuildStrategy<any> ? K : never;
}[keyof TRecord & string];
