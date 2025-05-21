import type { IDefinitionSymbol } from '../def-symbol.js';

import type { AnyDefinitionSymbol } from './IDefinition.js';

// prettier-ignore
export type Instance<T extends AnyDefinitionSymbol> =
  T extends IDefinitionSymbol<infer TInstance, any> ? TInstance :
  unknown;

export type InstancesArray<T extends IDefinitionSymbol<any, any>[]> = {
  [K in keyof T]: Instance<T[K]>;
};
