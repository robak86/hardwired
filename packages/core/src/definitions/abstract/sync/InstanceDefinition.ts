import { ContainerContext } from '../../../context/ContainerContext.js';
import { LifeTime } from '../LifeTime.js';
import { Resolution } from '../Resolution.js';
import { v4 } from 'uuid';
import type { AnyInstanceDefinition } from '../AnyInstanceDefinition.js';
import type { AsyncInstanceDefinition } from '../async/AsyncInstanceDefinition.js';
import { BaseDefinition } from '../FnDefinition.js';

export class InstanceDefinition<TInstance, TLifeTime extends LifeTime, TMeta> {
  static create<TInstance, TLifeTime extends LifeTime, TMeta>(
    strategy: TLifeTime,
    create: (context: ContainerContext) => TInstance,
    dependencies: InstanceDefinition<any, any, any>[],
    meta?: TMeta,
  ) {
    return new InstanceDefinition<TInstance, TLifeTime, TMeta>(
      v4(),
      Resolution.sync,
      strategy,
      create,
      dependencies,
      meta,
    );
  }

  constructor(
    readonly id: string,
    readonly resolution: Resolution.sync,
    readonly strategy: TLifeTime,
    readonly create: (context: ContainerContext) => TInstance,
    readonly dependencies: InstanceDefinition<any, any, any>[],
    readonly meta?: TMeta,
  ) {}
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
export type Instance<T extends AnyInstanceDefinition<any, any, any>> =
  T extends InstanceDefinition<infer T, any, any> ? T :
  T extends AsyncInstanceDefinition<infer T, any, any>? T :
  T extends BaseDefinition<infer T, any, any, any> ? T :
  unknown;

// prettier-ignore
export type InstanceMeta<T extends AnyInstanceDefinition<any, any, any>> =
  T extends InstanceDefinition<any, any, infer TMeta> ? TMeta :
  T extends AsyncInstanceDefinition<any, any, infer TMeta>? TMeta :
  unknown;

export type InstancesArray<T extends AnyInstanceDefinition<any, any, any>[]> = {
  [K in keyof T]: Instance<T[K]>;
};

export type InstancesRecord<T extends Record<string, AnyInstanceDefinition<any, any, any>>> = {
  [K in keyof T]: Instance<T[K]>;
};
