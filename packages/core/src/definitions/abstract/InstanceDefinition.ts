import { AnyInstanceDefinition } from './AnyInstanceDefinition';
import { AsyncInstanceDefinition } from './AsyncInstanceDefinition';
import { ContainerContext } from '../../context/ContainerContext';
import { LifeTime} from './LifeTime';
import { Resolution } from "./Resolution";

export type InstanceDefinitionContext = ContainerContext;

export type InstanceDefinition<TInstance, TLifeTime extends LifeTime, TExternals = []> = {
  id: string;
  strategy: TLifeTime;
  resolution: Resolution.sync;
  externals: Array<InstanceDefinition<any, any>>;
  create: (context: InstanceDefinitionContext, _?: TExternals) => TInstance; // _ is fake parameter introduced in order to preserve TExternal type
};

export const instanceDefinition = {
  isAsync(val: AnyInstanceDefinition<any, any, any>): val is AsyncInstanceDefinition<any, any, any> {
    return (val as any).isAsync;
  },
  isSync(val: AnyInstanceDefinition<any, any, any>): val is InstanceDefinition<any, any> {
    return !(val as any).isAsync;
  },
};
