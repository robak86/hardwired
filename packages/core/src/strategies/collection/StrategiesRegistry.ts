import invariant from 'tiny-invariant';
import { AsyncBuildStrategy, BuildStrategy } from '../abstract/BuildStrategy';

export class StrategiesRegistry {
  constructor(
    private syncStrategies: Record<symbol, BuildStrategy>,
    private asyncStrategies: Record<symbol, AsyncBuildStrategy>,
  ) {
    const syncKeys = Object.keys(syncStrategies);
    const asyncKeys = Object.keys(asyncStrategies);

    syncKeys.some(syncKey => {
      if (asyncKeys.includes(syncKey)) {
        throw new Error(`Duplicate identifier for strategies: ${syncKey}`);
      }
    });
  }

  get(key: symbol): BuildStrategy {
    const strategy = this.syncStrategies[key];
    invariant(strategy, `Strategy implementation for ${key.toString()} is missing`);
    return strategy;
  }

  getAsync(key: symbol): AsyncBuildStrategy | BuildStrategy {
    const asyncStrategy = this.asyncStrategies[key];
    const strategy = this.syncStrategies[key];
    invariant(strategy || asyncStrategy, `Strategy implementation for ${key.toString()} is missing`);
    return strategy || asyncStrategy;
  }
}
