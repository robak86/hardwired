import invariant from 'tiny-invariant';
import { AsyncBuildStrategy, BuildStrategy } from '../abstract/BuildStrategy';

export class StrategiesRegistry {
  constructor(private strategies: Record<symbol, BuildStrategy | AsyncBuildStrategy>) {}

  get(key: symbol): AsyncBuildStrategy | BuildStrategy {
    const strategy = this.strategies[key];
    invariant(strategy, `Strategy implementation for ${key.toString()} is missing`);
    return strategy;
  }
}
