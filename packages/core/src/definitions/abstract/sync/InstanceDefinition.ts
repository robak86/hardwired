import { ContainerContext } from '../../../context/ContainerContext.js';
import { LifeTime } from '../LifeTime.js';
import { Resolution } from '../Resolution.js';
import { v4 } from 'uuid';

export class InstanceDefinition<TInstance, TLifeTime extends LifeTime, TMeta> {
  static create<TInstance, TLifeTime extends LifeTime, TMeta>(
    strategy: TLifeTime,
    create: (context: ContainerContext) => TInstance,
    meta?: TMeta,
  ) {
    return new InstanceDefinition<TInstance, TLifeTime, TMeta>(v4(), Resolution.sync, strategy, create, meta);
  }

  constructor(
    readonly id: string,
    readonly resolution: Resolution.sync | Resolution.async,
    readonly strategy: TLifeTime,
    readonly create: (context: ContainerContext) => TInstance,
    readonly meta?: TMeta,
  ) {}

  use(): TInstance {
    return this.create(ContainerContext.empty());
  }
}

export const isInstanceDef = (val: any): val is InstanceDefinition<any, any, any> => {
  return (
    typeof val.id === 'string' &&
    val.resolution === Resolution.sync &&
    typeof val.strategy === 'string' &&
    val.create instanceof Function
  );
};

// prettier-ignore
export type Instance<T extends InstanceDefinition<any, any, any>> =
  T extends InstanceDefinition<infer T, any, any> ? T :
  unknown;

// prettier-ignore
export type InstanceMeta<T extends InstanceDefinition<any, any, any>> =
  T extends InstanceDefinition<any, any, infer TMeta> ? TMeta :
  unknown;

export type InstancesArray<T extends InstanceDefinition<any, any, any>[]> = {
  [K in keyof T]: Instance<T[K]>;
};

export type InstancesRecord<T extends Record<string, InstanceDefinition<any, any, any>>> = {
  [K in keyof T]: Instance<T[K]>;
};
