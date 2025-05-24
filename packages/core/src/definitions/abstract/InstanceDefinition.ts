import type { IDefinitionToken } from '../def-symbol.js';

import type { AnyDefinitionSymbol } from './IDefinition.js';

// prettier-ignore
export type Instance<T extends AnyDefinitionSymbol> =
  T extends IDefinitionToken<infer TInstance, any> ? TInstance :
  unknown;

export type InstancesArray<T extends IDefinitionToken<any, any>[]> = {
  [K in keyof T]: Instance<T[K]>;
};
