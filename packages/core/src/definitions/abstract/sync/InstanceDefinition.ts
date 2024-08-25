import { BaseDefinition } from '../FnDefinition.js';

// prettier-ignore
export type Instance<T extends BaseDefinition<any, any, any, any>> =
  T extends BaseDefinition<infer TInstance, any, any, any> ? TInstance :
  unknown;

// prettier-ignore
export type InstanceMeta<T extends BaseDefinition<any, any, any, any>> =
  T extends BaseDefinition<any, any, infer TMeta, any> ? TMeta :
  unknown;

export type InstancesArray<T extends BaseDefinition<any, any, any, any>[]> = {
  [K in keyof T]: Instance<T[K]>;
};

export type InstancesRecord<T extends Record<string, BaseDefinition<any, any, any, any>>> = {
  [K in keyof T]: Instance<T[K]>;
};
