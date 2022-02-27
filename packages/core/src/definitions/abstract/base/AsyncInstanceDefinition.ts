import { InstanceDefinition, InstanceDefinitionContext } from './InstanceDefinition';
import { LifeTime } from '../LifeTime';
import { Resolution } from '../Resolution';
import { BaseDefinition } from './BaseDefinition';

interface AsyncInstanceDefinitionParams<T, TLifeTime extends LifeTime, TExternals> {
  id?: string;
  strategy: TLifeTime;
  externals: Array<InstanceDefinition<any, any>>;
  create: (context: InstanceDefinitionContext, _?: TExternals) => Promise<T>;
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
