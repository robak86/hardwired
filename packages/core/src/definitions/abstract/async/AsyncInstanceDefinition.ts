import { LifeTime } from '../LifeTime.js';
import { Resolution } from '../Resolution.js';
import { v4 } from 'uuid';
import { AnyInstanceDefinition } from '../AnyInstanceDefinition.js';
import { IServiceLocator } from '../../../container/IContainer.js';

export type AsyncInstanceDefinition<T, TLifeTime extends LifeTime, TMeta> = {
  readonly id: string;
  readonly strategy: TLifeTime;
  readonly resolution: Resolution.async;
  readonly create: (context: IServiceLocator) => Promise<T>;
  readonly dependencies: AnyInstanceDefinition<any, any, any>[];
  readonly meta?: TMeta;
};

export function asyncDefinition<TInstance, TLifeTime extends LifeTime, TMeta>({
  id = v4(),
  strategy,
  create,
  meta,
  dependencies,
}: {
  id?: string;
  strategy: TLifeTime;
  create: (context: IServiceLocator) => Promise<TInstance>;
  dependencies: AnyInstanceDefinition<any, any, any>[];
  meta?: TMeta;
}): AsyncInstanceDefinition<TInstance, TLifeTime, TMeta> {
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
export const isAsyncInstanceDef = (val: any): val is AsyncInstanceDefinition<any, any, any> => {
  return (
    typeof val.id === 'string' &&
    val.resolution === Resolution.async &&
    typeof val.strategy === 'string' &&
    val.create instanceof Function
  );
};

// prettier-ignore
export type AsyncInstance<T extends AsyncInstanceDefinition<any, any, any>> =
    T extends AsyncInstanceDefinition<infer T, any, any> ? T : unknown;

export type AsyncInstancesArray<T extends AsyncInstanceDefinition<any, any, any>[]> = {
  [K in keyof T]: AsyncInstance<T[K]>;
};
