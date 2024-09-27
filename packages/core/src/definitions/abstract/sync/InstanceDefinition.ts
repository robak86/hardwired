import { Definition } from '../Definition.js';

// prettier-ignore
export type Instance<T extends Definition<any, any, any>> =
  T extends Definition<infer TInstance, any, any> ? TInstance :
  unknown;

export type InstancesArray<T extends Definition<any, any, any>[]> = {
  [K in keyof T]: Instance<T[K]>;
};

export type InstancesDefinitions<T extends any[]> = {
  [K in keyof T]: Definition<T[K], any, any>;
};

export type InstancesRecord<T extends Record<string, Definition<any, any, any>>> = {
  [K in keyof T]: Instance<T[K]>;
};
