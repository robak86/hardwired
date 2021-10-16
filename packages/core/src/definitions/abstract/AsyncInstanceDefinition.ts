import { InstanceDefinition, InstanceDefinitionContext } from './InstanceDefinition';
import { LifeTime} from './LifeTime';
import { Resolution } from "./Resolution";

export type AsyncInstanceDefinition<T, TLifeTime extends LifeTime, TExternals> = {
  id: string;
  strategy: TLifeTime;
  resolution: Resolution.async;
  externals: Array<InstanceDefinition<any, any>>;
  create: (context: InstanceDefinitionContext, _?:TExternals) => Promise<T>;
};
