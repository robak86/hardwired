import { ContainerContext } from '../../../context/ContainerContext';
import { LifeTime } from '../LifeTime';
import { Resolution } from '../Resolution';
import { ExternalsInstances } from '../base/BaseDefinition';

export type InstanceDefinitionContext = ContainerContext;

export type InstanceDefinition<TInstance, TLifeTime extends LifeTime, TExternals> = {
  id: string;
  strategy: TLifeTime;
  resolution: Resolution.sync;
  externals: ExternalsInstances<TExternals>;
  create: (context: InstanceDefinitionContext, _?: TExternals) => TInstance; // _ is fake parameter introduced in order to preserve TExternal type
};
