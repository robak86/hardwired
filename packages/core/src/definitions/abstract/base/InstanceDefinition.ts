import { ContainerContext } from '../../../context/ContainerContext';
import { LifeTime } from '../LifeTime';
import { Resolution } from '../Resolution';
import { BaseDefinition } from './BaseDefinition';


export interface InstanceDefinitionParams<TInstance, TLifeTime extends LifeTime = any, TExternals extends any[] = []> {
  strategy: TLifeTime;
  create: (context: ContainerContext, _?: TExternals) => TInstance;
  externals: Array<InstanceDefinition<any, any>>;
  externalsValues?: any[];
  id?: string;
}

export class InstanceDefinition<
  TInstance,
  TLifeTime extends LifeTime = any,
  TExternals extends any[] = [],
> extends BaseDefinition<TInstance, TLifeTime, TExternals, Resolution.sync> {
  constructor(params: InstanceDefinitionParams<TInstance, TLifeTime, TExternals>) {
    super(Resolution.sync, params);
  }
}
