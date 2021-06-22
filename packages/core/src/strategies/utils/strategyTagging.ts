import { BuildStrategyFactory } from '../abstract/BuildStrategy';
import invariant from 'tiny-invariant';
import { BuildStrategy } from '../../resolvers/abstract/BuildStrategy';

export function buildTaggedStrategy<T extends BuildStrategyFactory<any, any>>(strategyFactory: T, symbol: symbol): T {
  invariant(!isStrategyTagged(strategyFactory), `Cannot tag strategy. Given function is already tagged`);
  (strategyFactory as any).strategyTag = symbol;
  return strategyFactory;
}

export function getStrategyTag(strategyFactory: BuildStrategyFactory<any, any> | BuildStrategy<any>): symbol {
  return (strategyFactory as any).strategyTag;
}

export function isStrategyTagged(strategyFactory: BuildStrategyFactory<any, any> | BuildStrategy<any>): boolean {
  return !!(strategyFactory as any).strategyTag;
}
