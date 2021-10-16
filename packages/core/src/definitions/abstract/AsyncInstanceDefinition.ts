import { InstanceDefinition, InstanceDefinitionContext } from './InstanceDefinition';
import { LifeTime, Resolution } from './LifeTime';

export type AsyncInstanceDefinition<T, TLifeTime extends LifeTime, TExternals> = {
  id: string;
  strategy: TLifeTime;
  resolution: Resolution.async;
  externals: Array<InstanceDefinition<any, any>>;
  create: (context: InstanceDefinitionContext) => Promise<T>;
};
