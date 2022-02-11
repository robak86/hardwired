import { ContainerContext } from '../../context/ContainerContext';
import { LifeTime } from './LifeTime';
import { Resolution } from './Resolution';

export type InstanceDefinitionContext = ContainerContext;

export type InstanceDefinition<TInstance, TLifeTime extends LifeTime = any, TExternals extends any[] = []> = {
  id: string;
  strategy: TLifeTime;
  resolution: Resolution.sync;
  externals: Array<InstanceDefinition<any, any>>;
  create: (context: InstanceDefinitionContext, _?: TExternals) => TInstance; // _ is fake parameter introduced in order to preserve TExternal type
  // bind: (...externals: TExternals) => InstanceDefinition<TInstance, TLifeTime, []>;
};
