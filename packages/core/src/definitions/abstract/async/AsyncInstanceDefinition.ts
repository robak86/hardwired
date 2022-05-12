import { LifeTime } from '../LifeTime';
import { Resolution } from '../Resolution';
import { InstanceDefinitionContext } from '../sync/InstanceDefinition';
import { ExternalsInstances } from '../base/BaseDefinition';

export type AsyncInstanceDefinition<T, TLifeTime extends LifeTime, TExternals> = {
  id: string;
  strategy: TLifeTime;
  resolution: Resolution.async;
  externals: ExternalsInstances<TExternals>;
  create: (context: InstanceDefinitionContext, _?: TExternals) => Promise<T>;
};
