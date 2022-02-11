import { InstanceDefinition, InstanceDefinitionContext } from './InstanceDefinition';
import { LifeTime } from './LifeTime';
import { Resolution } from './Resolution';
import { v4 } from 'uuid';

interface AsyncInstanceDefinitionParams<T, TLifeTime extends LifeTime, TExternals> {
  id?: string;
  strategy: TLifeTime;
  externals: Array<InstanceDefinition<any, any>>;
  create: (context: InstanceDefinitionContext, _?: TExternals) => Promise<T>;
}

export class AsyncInstanceDefinition<T, TLifeTime extends LifeTime, TExternals> {
  public readonly id: string;
  public readonly strategy: TLifeTime;
  public readonly resolution: Resolution.async = Resolution.async;
  public readonly externals: Array<InstanceDefinition<any, any>>;
  public readonly create: (context: InstanceDefinitionContext, _?: TExternals) => Promise<T>;

  constructor({ id = v4(), strategy, externals, create }: AsyncInstanceDefinitionParams<T, TLifeTime, TExternals>) {
    this.create = create;
    this.externals = externals;
    this.strategy = strategy;
    this.id = id;
  }
}
