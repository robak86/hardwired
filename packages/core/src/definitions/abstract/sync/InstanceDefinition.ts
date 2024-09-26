import { BaseDefinition } from '../BaseDefinition.js';

// prettier-ignore
export type Instance<T extends BaseDefinition<any, any, any>> =
  T extends BaseDefinition<infer TInstance, any, any> ? TInstance :
  unknown;

export type InstancesArray<T extends BaseDefinition<any, any, any>[]> = {
  [K in keyof T]: Instance<T[K]>;
};

export type InstancesDefinitions<T extends any[]> = {
  [K in keyof T]: BaseDefinition<T[K], any, any>;
};

export type InstancesRecord<T extends Record<string, BaseDefinition<any, any, any>>> = {
  [K in keyof T]: Instance<T[K]>;
};
