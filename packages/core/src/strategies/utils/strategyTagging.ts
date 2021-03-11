import { BuildStrategyFactory } from '../abstract/BuildStrategy';
import invariant from 'tiny-invariant';
import { Instance } from '../../resolvers/abstract/Instance';

export function buildTaggedStrategy<T extends BuildStrategyFactory<any, any>>(strategyFactory: T, symbol: symbol): T {
  invariant(!isStrategyTagged(strategyFactory), `Cannot tag strategy. Given function is already tagged`);
  (strategyFactory as any).strategyTag = symbol;
  return strategyFactory;
}

export function getStrategyTag(strategyFactory: BuildStrategyFactory<any, any> | Instance<any>): symbol {
  return (strategyFactory as any).strategyTag;
}

export function isStrategyTagged(strategyFactory: BuildStrategyFactory<any, any> | Instance<any>): boolean {
  return !!(strategyFactory as any).strategyTag;
}
