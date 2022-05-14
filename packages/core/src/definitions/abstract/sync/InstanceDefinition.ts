import { ContainerContext } from '../../../context/ContainerContext';
import { LifeTime } from '../LifeTime';
import { Resolution } from '../Resolution';
import { ExternalsDefinitions } from '../base/BaseDefinition';
import { assertNoExternals, pickExternals, PickExternals } from '../../../utils/PickExternals';
import { v4 } from 'uuid';

export type InstanceDefinitionContext = ContainerContext;

export type InstanceDefinition<TInstance, TLifeTime extends LifeTime, TExternals> = {
  id: string;
  strategy: TLifeTime;
  resolution: Resolution.sync;
  externals: ExternalsDefinitions<TExternals>;
  create: (context: InstanceDefinitionContext) => TInstance; // _ is fake parameter introduced in order to preserve TExternal type
};

export function instanceDefinition<
  TInstance,
  TLifeTime extends LifeTime,
  TDependency extends InstanceDefinition<any, any, any>[],
>({
  id = v4(),
  dependencies,
  strategy,
  create,
}: {
  id?: string;
  dependencies: [...TDependency];
  strategy: TLifeTime;
  create: (context: InstanceDefinitionContext) => TInstance;
}): InstanceDefinition<TInstance, TLifeTime, PickExternals<TDependency>> {
  const externals = pickExternals(dependencies);
  assertNoExternals(strategy, externals);

  return {
    id,
    strategy,
    externals,
    create,
    resolution: Resolution.sync,
  };
}

export type Instance<T extends InstanceDefinition<any, any, any>> = T extends InstanceDefinition<infer T, any, any>
  ? T
  : unknown;

export type InstancesArray<T extends InstanceDefinition<any, any, any>[]> = {
  [K in keyof T]: Instance<T[K]>;
};
