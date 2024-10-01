import { AnyDefinition, Definition } from '../Definition.js';

// prettier-ignore
export type Instance<T extends AnyDefinition> =
  T extends Definition<infer TInstance, any, any> ? TInstance :
  unknown;

export type InstancesArray<T extends AnyDefinition[]> = {
  [K in keyof T]: Instance<T[K]>;
};

export type InstancesDefinitions<T extends any[]> = {
  [K in keyof T]: Definition<T[K], any, any>;
};

export type InstancesRecord<T extends Record<string, AnyDefinition>> = {
  [K in keyof T]: Instance<T[K]>;
};
