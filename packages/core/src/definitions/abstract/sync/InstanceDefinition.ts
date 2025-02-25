import { AnyDefinition, Definition } from '../Definition.js';
import { AwaitedInstance } from '../../../container/IContainer.js';
import { ValidDependenciesLifeTime } from './InstanceDefinitionDependency.js';
import { LifeTime } from '../LifeTime.js';

// prettier-ignore
export type Instance<T extends AnyDefinition> =
  T extends Definition<infer TInstance, any, any> ? TInstance :
  unknown;

export type InstancesObject<T extends Record<PropertyKey, Definition<any, any, any>>> = {
  [K in keyof T]: Instance<T[K]>;
};

export type AwaitedInstanceRecord<T extends Record<PropertyKey, AnyDefinition>> = {
  [K in keyof T]: AwaitedInstance<T[K]>;
};

export type InstancesArray<T extends AnyDefinition[]> = {
  [K in keyof T]: Instance<T[K]>;
};

export type InstancesDefinitions<T extends any[], TCurrentLifeTime extends LifeTime> = {
  [K in keyof T]: Definition<T[K], ValidDependenciesLifeTime<TCurrentLifeTime>, any>;
};

export type InstancesRecord<T extends Record<PropertyKey, AnyDefinition>> = {
  [K in keyof T]: Instance<T[K]>;
};
