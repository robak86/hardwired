import invariant from 'tiny-invariant';
import { BuildStrategy } from '../abstract/BuildStrategy';
import { AsyncBuildStrategy } from "../abstract/AsyncBuildStrategy";

export class StrategiesRegistry {
  constructor(private strategies: Record<symbol, BuildStrategy | AsyncBuildStrategy>) {}

  get(key: symbol): AsyncBuildStrategy | BuildStrategy {
    const strategy = this.strategies[key];
    invariant(strategy, `Strategy implementation for ${key.toString()} is missing`);
    return strategy;
  }
}
