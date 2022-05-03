import { ContainerContext } from '../../../context/ContainerContext';
import { LifeTime } from '../LifeTime';
import { Resolution } from '../Resolution';
import { v4 } from 'uuid';

export type BaseDefinitionContext = ContainerContext;

export interface BaseDefinitionParams<TInstance, TLifeTime extends LifeTime = any, TExternals extends any[] = []> {
  strategy: TLifeTime;
  create: (context: BaseDefinitionContext, _?: TExternals) => TInstance;
  externals: Array<BaseDefinition<any, any, any, any>>;
  externalsValues?: any[];
  id?: string;
}

export class BaseDefinition<
  TInstance,
  TLifeTime extends LifeTime,
  TExternals extends any[],
  TResolution extends Resolution,
> {
  readonly id: string;
  readonly strategy: TLifeTime;
  readonly externals: Array<BaseDefinition<any, any, any, any>>; // TODO: make protected and hide logic for creating externals within this class
  readonly scopeOverrides: BaseDefinition<any, any, any, any>[] | null = null;

  readonly resolution: TResolution; // discriminator used for disabling usage of async defs as a dependencies to sync defs
  readonly create: (context: BaseDefinitionContext) => TInstance;
  readonly externalsValues: any[] = [];x

  constructor(
    resolution: TResolution,
    { strategy, create, externals, id = v4(), externalsValues }: BaseDefinitionParams<TInstance, TLifeTime, TExternals>,
  ) {
    if (strategy === LifeTime.singleton && externals.length > 0) {
      throw new Error('Externals with singleton life time are not supported');
    }

    this.id = id;
    this.externals = externals;
    this.create = create;
    this.strategy = strategy;
    this.resolution = resolution;

    if (externalsValues) {
      if (externalsValues.length !== this.externals.length) {
        throw new Error('Invalid external params count');
      }

      const boundExternals = {};
      externalsValues.forEach((extValue, idx) => {
        const externalDef = this.externals[idx];
        boundExternals[externalDef.id] = extValue;
      });

      this.externalsValues = externalsValues;
      this.scopeOverrides = Object.keys(boundExternals).map(id => {
        return new BaseDefinition(Resolution.sync, {
          id,

          externals: [],
          strategy: LifeTime.transient,
          create: () => boundExternals[id],
        });
      });
    }
  }

  bind(...externals: TExternals): BaseDefinition<TInstance, TLifeTime, [], TResolution> {
    return new BaseDefinition<TInstance, TLifeTime, [], TResolution>(this.resolution, {
      id: this.id,
      create: this.create,
      externals: this.externals,
      strategy: this.strategy,
      externalsValues: externals,
    });
  }
}
