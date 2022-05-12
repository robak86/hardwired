import { LifeTime } from '../LifeTime';
import { Resolution } from '../Resolution';
import { InstanceDefinitionContext } from '../sync/InstanceDefinition';
import { ExternalsDefinitions } from '../base/BaseDefinition';

export type AsyncInstanceDefinition<T, TLifeTime extends LifeTime, TExternals> = {
  id: string;
  strategy: TLifeTime;
  resolution: Resolution.async;
  externals: ExternalsDefinitions<TExternals>;
  create: (context: InstanceDefinitionContext) => Promise<T>;
};
