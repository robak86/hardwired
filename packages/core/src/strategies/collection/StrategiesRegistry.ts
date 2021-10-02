import invariant from 'tiny-invariant';
import { BuildStrategy } from '../abstract/BuildStrategy';

export class StrategiesRegistry {
  constructor(private strategies: Record<symbol, BuildStrategy>) {}

  get(key: symbol): BuildStrategy {
    const strategy = this.strategies[key];
    invariant(strategy, `Strategy implementation for ${key.toString()} is missing`);
    return strategy;
  }
}
