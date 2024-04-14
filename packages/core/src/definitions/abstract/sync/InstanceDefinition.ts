import { ContainerContext } from '../../../context/ContainerContext.js';
import { LifeTime } from '../LifeTime.js';
import { Resolution } from '../Resolution.js';
import { v4 } from 'uuid';
import type { AnyInstanceDefinition } from '../AnyInstanceDefinition.js';
import type { AsyncInstanceDefinition } from '../async/AsyncInstanceDefinition.js';

export class InstanceDefinition<TInstance, TLifeTime extends LifeTime> {
  static create<TInstance, TLifeTime extends LifeTime>(
    strategy: TLifeTime,
    create: (context: ContainerContext) => TInstance,
    meta: Record<string, any> = {},
  ) {
    return new InstanceDefinition<TInstance, TLifeTime>(v4(), Resolution.sync, strategy, create, meta);
  }

  constructor(
    readonly id: string,
    readonly resolution: Resolution.sync,
    readonly strategy: TLifeTime,
    readonly create: (context: ContainerContext) => TInstance,
    readonly meta: Record<string, any>,
  ) {}
}

export const isInstanceDef = (val: any): val is InstanceDefinition<any, any> => {
  return (
    typeof val.id === 'string' &&
    val.resolution === Resolution.sync &&
    typeof val.strategy === 'string' &&
    val.create instanceof Function
  );
};

// prettier-ignore
export type Instance<T extends AnyInstanceDefinition<any, any>> =
  T extends InstanceDefinition<infer T, any> ? T :
  T extends AsyncInstanceDefinition<infer T, any>? T :
    unknown;

export type InstancesArray<T extends AnyInstanceDefinition<any, any>[]> = {
  [K in keyof T]: Instance<T[K]>;
};
