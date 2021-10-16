import invariant from 'tiny-invariant';
import { BuildStrategy } from '../abstract/BuildStrategy';
import { AsyncBuildStrategy } from '../abstract/AsyncBuildStrategy';
import { LifeTime, Resolution } from '../../definitions/abstract/LifeTime';

export class StrategiesRegistry {
  private readonly strategies: Record<LifeTime, Record<Resolution, BuildStrategy | AsyncBuildStrategy>>;

  constructor(syncStrategies: Record<LifeTime, BuildStrategy>, async: Record<LifeTime, AsyncBuildStrategy>) {
    this.strategies = {} as any;

    Object.keys(syncStrategies).forEach(lifeTime => {
      const strategy = syncStrategies[lifeTime];

      const strategiesForLifetime = this.strategies[lifeTime] || (this.strategies[lifeTime] = {});
      strategiesForLifetime[Resolution.sync] = strategy;
    });

    Object.keys(async).forEach(lifeTime => {
      const strategy = syncStrategies[lifeTime];

      const strategiesForLifetime = this.strategies[lifeTime] || (this.strategies[lifeTime] = {});
      strategiesForLifetime[Resolution.async] = strategy;
    });
  }

  get(lifeTime: LifeTime, resolution: Resolution): BuildStrategy | AsyncBuildStrategy {
    const strategy = this.strategies[lifeTime][resolution];
    invariant(strategy, `Strategy implementation for ${lifeTime.toString()} is missing`);
    return strategy;
  }
}
