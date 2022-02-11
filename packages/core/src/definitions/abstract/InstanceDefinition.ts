import { ContainerContext } from '../../context/ContainerContext';
import { LifeTime } from './LifeTime';
import { Resolution } from './Resolution';
import { v4 } from 'uuid';

export type InstanceDefinitionContext = ContainerContext;

interface InstanceDefinitionParams<TInstance, TLifeTime extends LifeTime = any, TExternals extends any[] = []> {
  strategy: TLifeTime;
  create: (context: InstanceDefinitionContext, _?: TExternals) => TInstance;
  externals: Array<InstanceDefinition<any, any>>;
  boundExternals?: Record<string, any> | null;
  id?: string;
}

export class InstanceDefinition<TInstance, TLifeTime extends LifeTime = any, TExternals extends any[] = []> {
  readonly id: string;
  readonly strategy: TLifeTime;
  readonly resolution: Resolution.sync = Resolution.sync;
  readonly create: (context: InstanceDefinitionContext, _?: TExternals) => TInstance; // TODO: create should be abstract and implemented by concrete definitions
  readonly externals: Array<InstanceDefinition<any, any>>;
  readonly boundExternals: Record<string, any> | null = null;

  constructor({
    strategy,
    create,
    externals,
    id = v4(),
    boundExternals = null,
  }: InstanceDefinitionParams<TInstance, TLifeTime, TExternals>) {
    this.id = id;
    this.boundExternals = boundExternals;
    this.externals = externals;
    this.create = create;
    this.strategy = strategy;
  }

  bind(...externals: TExternals): InstanceDefinition<TInstance, TLifeTime, []> {
    const boundExternals = {};

    externals.forEach((extValue, idx) => {
      const externalDef = this.externals[idx];
      boundExternals[externalDef.id] = extValue;
    });

    return new InstanceDefinition<TInstance, TLifeTime, []>({
      id: this.id,
      create: this.create as any,
      externals: [],
      strategy: this.strategy,
      boundExternals,
    });
  }
}
