import { LifeTime } from '../LifeTime.js';
import { Resolution } from '../Resolution.js';
import { ContainerContext } from '../../../context/ContainerContext.js';
import { v4 } from 'uuid';
import { AnyInstanceDefinition } from '../AnyInstanceDefinition.js';

export type AsyncInstanceDefinition<T, TLifeTime extends LifeTime> = {
  readonly id: string;
  readonly strategy: TLifeTime;
  readonly resolution: Resolution.async;
  readonly create: (context: ContainerContext) => Promise<T>;
  readonly dependencies: AnyInstanceDefinition<any, any>[];
  readonly meta?: Record<string, any>;
};

export function asyncDefinition<TInstance, TLifeTime extends LifeTime>({
  id = v4(),
  strategy,
  create,
  meta,
  dependencies,
}: {
  id?: string;
  strategy: TLifeTime;
  create: (context: ContainerContext) => Promise<TInstance>;
  dependencies: AnyInstanceDefinition<any, any>[];
  meta?: Record<string, any>;
}): AsyncInstanceDefinition<TInstance, TLifeTime> {
  return {
    id,
    strategy,
    create,
    resolution: Resolution.async,
    dependencies,
    meta,
  };
}

// TODO: is this check really necessary? perf ?
export const isAsyncInstanceDef = (val: any): val is AsyncInstanceDefinition<any, any> => {
  return (
    typeof val.id === 'string' &&
    val.resolution === Resolution.async &&
    typeof val.strategy === 'string' &&
    val.create instanceof Function
  );
};

// prettier-ignore
export type AsyncInstance<T extends AsyncInstanceDefinition<any, any>> =
    T extends AsyncInstanceDefinition<infer T, any> ? T : unknown;

export type AsyncInstancesArray<T extends AsyncInstanceDefinition<any, any>[]> = {
  [K in keyof T]: AsyncInstance<T[K]>;
};
