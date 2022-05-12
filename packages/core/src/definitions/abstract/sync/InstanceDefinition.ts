import { ContainerContext } from '../../../context/ContainerContext';
import { LifeTime } from '../LifeTime';
import { Resolution } from '../Resolution';
import { ExternalsDefinitions } from '../base/BaseDefinition';

export type InstanceDefinitionContext = ContainerContext;

export type InstanceDefinition<TInstance, TLifeTime extends LifeTime, TExternals> = {
  id: string;
  strategy: TLifeTime;
  resolution: Resolution.sync;
  externals: ExternalsDefinitions<TExternals>;
  create: (context: InstanceDefinitionContext) => TInstance; // _ is fake parameter introduced in order to preserve TExternal type
};
