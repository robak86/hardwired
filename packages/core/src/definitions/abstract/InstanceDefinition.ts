import type { AwaitedInstance } from '../../container/IContainer.js';

import type { LifeTime } from './LifeTime.js';
import type { AnyDefinition, IDefinition } from './IDefinition.js';
import type { ValidDependenciesLifeTime } from './InstanceDefinitionDependency.js';

// prettier-ignore
export type Instance<T extends AnyDefinition> =
  T extends IDefinition<infer TInstance, any, any> ? TInstance :
  unknown;

export type InstancesObject<T extends Record<PropertyKey, IDefinition<any, any, any>>> = {
  [K in keyof T]: Instance<T[K]>;
};

export type AwaitedInstanceRecord<T extends Record<PropertyKey, AnyDefinition>> = {
  [K in keyof T]: AwaitedInstance<T[K]>;
};

export type InstancesArray<T extends AnyDefinition[]> = {
  [K in keyof T]: Instance<T[K]>;
};

export type InstancesDefinitions<T extends any[], TCurrentLifeTime extends LifeTime> = {
  [K in keyof T]: IDefinition<T[K], ValidDependenciesLifeTime<TCurrentLifeTime>, any>;
};

export type InstancesRecord<T extends Record<PropertyKey, AnyDefinition>> = {
  [K in keyof T]: Instance<T[K]>;
};
