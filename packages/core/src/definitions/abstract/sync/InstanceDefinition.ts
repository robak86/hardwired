import { ContainerContext } from '../../../context/ContainerContext.js';
import { LifeTime } from '../LifeTime.js';
import { Resolution } from '../Resolution.js';
import { v4 } from 'uuid';

export type InstanceDefinition<TInstance, TLifeTime extends LifeTime> = {
  readonly id: string;
  readonly strategy: TLifeTime;
  readonly resolution: Resolution.sync;
  readonly create: (context: ContainerContext) => TInstance; // _ is a fake parameter introduced in order to preserve TExternal type
  readonly meta: Record<string, any>;
};

export function instanceDefinition<TInstance, TLifeTime extends LifeTime>({
  id = v4(),
  strategy,
  create,
  meta,
}: {
  id?: string;
  strategy: TLifeTime;
  create: (context: ContainerContext) => TInstance;
  serializable?: boolean;
  meta?: any;
}): InstanceDefinition<TInstance, TLifeTime> {
  return {
    id,
    strategy,
    create,
    resolution: Resolution.sync,
    meta,
  };
}

export const isInstanceDef = (val: any): val is InstanceDefinition<any, any> => {
  return (
    typeof val.id === 'string' &&
    val.resolution === Resolution.sync &&
    typeof val.strategy === 'string' &&
    val.create instanceof Function
  );
};

export type Instance<T extends InstanceDefinition<any, any>> = T extends InstanceDefinition<infer T, any> ? T : unknown;

export type InstancesArray<T extends InstanceDefinition<any, any>[]> = {
  [K in keyof T]: Instance<T[K]>;
};
