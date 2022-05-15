import { BuildStrategy } from '../abstract/BuildStrategy.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';

export class StrategiesRegistry {
  constructor(private syncStrategies: Record<LifeTime, BuildStrategy>) {}

  get(lifeTime: LifeTime): BuildStrategy {
    const strategy = this.syncStrategies[lifeTime];
    if (!strategy) {
      throw new Error(`Strategy implementation for ${lifeTime.toString()} is missing`);
    }
    return strategy;
  }
}
