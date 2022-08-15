import { LifeTime } from '../LifeTime.js';
import { Resolution } from '../Resolution.js';
import { ContainerContext } from '../../../context/ContainerContext.js';
import { v4 } from 'uuid';

export type AsyncInstanceDefinition<T, TLifeTime extends LifeTime> = {
  readonly id: string;
  readonly strategy: TLifeTime;
  readonly resolution: Resolution.async;
  readonly create: (context: ContainerContext) => Promise<T>;
};

export function asyncDefinition<TInstance, TLifeTime extends LifeTime>({
  id = v4(),
  strategy,
  create,
}: {
  id?: string;
  strategy: TLifeTime;
  create: (context: ContainerContext) => Promise<TInstance>;
}): AsyncInstanceDefinition<TInstance, TLifeTime> {
  return {
    id,
    strategy,
    create,
    resolution: Resolution.async,
  };
}

// prettier-ignore
export type AsyncInstance<T extends AsyncInstanceDefinition<any, any>> =
    T extends AsyncInstanceDefinition<infer T, any> ? T : unknown;

export type AsyncInstancesArray<T extends AsyncInstanceDefinition<any, any>[]> = {
  [K in keyof T]: AsyncInstance<T[K]>;
};
