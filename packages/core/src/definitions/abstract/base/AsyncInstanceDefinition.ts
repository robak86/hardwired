import { InstanceDefinition } from './InstanceDefinition';
import { LifeTime } from '../LifeTime';
import { Resolution } from '../Resolution';
import { BaseDefinition } from './BaseDefinition';
import { ContainerContext } from "../../../context/ContainerContext";

interface AsyncInstanceDefinitionParams<T, TLifeTime extends LifeTime, TExternals> {
  id?: string;
  strategy: TLifeTime;
  externals: Array<InstanceDefinition<any, any>>;
  create: (context: ContainerContext, _?: TExternals) => Promise<T>;
}

export class AsyncInstanceDefinition<T, TLifeTime extends LifeTime, TExternals extends any[]> extends BaseDefinition<
  Promise<T>,
  TLifeTime,
  TExternals,
  Resolution.async
> {
  constructor(params: AsyncInstanceDefinitionParams<T, TLifeTime, TExternals>) {
    super(Resolution.async, params);
  }
}
