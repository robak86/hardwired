import type { AwaitedInstance } from '../../container/IContainer.js';
import type { IDefinitionSymbol } from '../def-symbol.js';

import type { LifeTime } from './LifeTime.js';
import type { AnyDefinitionSymbol } from './IDefinition.js';
import type { ValidDependenciesLifeTime } from './InstanceDefinitionDependency.js';

// prettier-ignore
export type Instance<T extends AnyDefinitionSymbol> =
  T extends IDefinitionSymbol<infer TInstance, any> ? TInstance :
  unknown;

export type InstancesObject<T extends Record<PropertyKey, IDefinitionSymbol<any, any>>> = {
  [K in keyof T]: Instance<T[K]>;
};

export type AwaitedInstanceRecord<T extends Record<PropertyKey, AnyDefinitionSymbol>> = {
  [K in keyof T]: AwaitedInstance<T[K]>;
};

export type InstancesArray<T extends IDefinitionSymbol<any, any>[]> = {
  [K in keyof T]: Instance<T[K]>;
};

export type InstancesDefinitions<T extends any[], TCurrentLifeTime extends LifeTime> = {
  [K in keyof T]: IDefinitionSymbol<T[K], ValidDependenciesLifeTime<TCurrentLifeTime>>;
};

export type InstancesRecord<T extends Record<PropertyKey, AnyDefinitionSymbol>> = {
  [K in keyof T]: Instance<T[K]>;
};
