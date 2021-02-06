import { BuildStrategyFactory } from '../abstract/BuildStrategy';
import invariant from 'tiny-invariant';

export function buildTaggedStrategy<T extends BuildStrategyFactory<any, any>>(strategyFactory: T, symbol: symbol): T {
  invariant(!isStrategyTagged(strategyFactory), `Cannot tag strategy. Given function is already tagged`);
  (strategyFactory as any).strategyType = symbol;
  return strategyFactory;
}

export function getStrategyTag(strategyFactory: BuildStrategyFactory<any, any>): symbol {
  return (strategyFactory as any).strategyType;
}

export function isStrategyTagged(strategyFactory: BuildStrategyFactory<any, any>): boolean {
  return !!(strategyFactory as any).strategyType;
}
