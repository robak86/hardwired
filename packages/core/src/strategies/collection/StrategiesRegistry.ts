import invariant from 'tiny-invariant';
import { BuildStrategy } from '../abstract/BuildStrategy';
import { LifeTime } from '../../definitions/abstract/LifeTime';

export class StrategiesRegistry {
  constructor(private syncStrategies: Record<LifeTime, BuildStrategy>) {}

  get(lifeTime: LifeTime): BuildStrategy {
    const strategy = this.syncStrategies[lifeTime];
    invariant(strategy, `Strategy implementation for ${lifeTime.toString()} is missing`);
    return strategy;
  }
}
