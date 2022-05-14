import { LifeTime } from '../LifeTime';
import { Resolution } from '../Resolution';
import { ExternalsDefinitions } from '../base/BaseDefinition';
import { ContainerContext } from '../../../context/ContainerContext';
import { v4 } from 'uuid';
import { assertNoExternals, pickExternals, PickExternals } from '../../../utils/PickExternals';
import { AnyInstanceDefinition } from '../AnyInstanceDefinition';

export type AsyncInstanceDefinition<T, TLifeTime extends LifeTime, TExternals> = {
  id: string;
  strategy: TLifeTime;
  resolution: Resolution.async;
  externals: ExternalsDefinitions<TExternals>;
  create: (context: ContainerContext) => Promise<T>;
};

export function asyncDefinition<
  TInstance,
  TLifeTime extends LifeTime,
  TDependency extends AnyInstanceDefinition<any, any, any>[],
>({
  id = v4(),
  dependencies,
  strategy,
  create,
}: {
  id?: string;
  dependencies: [...TDependency];
  strategy: TLifeTime;
  create: (context: ContainerContext) => Promise<TInstance>;
}): AsyncInstanceDefinition<TInstance, TLifeTime, PickExternals<TDependency>> {
  const externals = pickExternals(dependencies);
  assertNoExternals(strategy, externals);

  return {
    id,
    strategy,
    externals,
    create,
    resolution: Resolution.async,
  };
}

// prettier-ignore
export type AsyncInstance<T extends AsyncInstanceDefinition<any, any, any>> =
    T extends AsyncInstanceDefinition<infer T, any, any> ? T : unknown;

export type AsyncInstancesArray<T extends AsyncInstanceDefinition<any, any, any>[]> = {
  [K in keyof T]: AsyncInstance<T[K]>;
};
