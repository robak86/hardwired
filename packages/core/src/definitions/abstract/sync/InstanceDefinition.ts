import { AnyDefinition, Definition } from '../Definition.js';
import { AwaitedInstance } from '../../../container/IContainer.js';

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

export type InstancesDefinitions<T extends any[]> = {
  [K in keyof T]: Definition<T[K], any, any>;
};

export type InstancesRecord<T extends Record<PropertyKey, AnyDefinition>> = {
  [K in keyof T]: Instance<T[K]>;
};
