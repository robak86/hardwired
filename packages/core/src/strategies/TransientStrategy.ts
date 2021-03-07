import { BuildStrategy } from './abstract/BuildStrategy';
import { Instance } from '../resolvers/abstract/Instance';
import { buildTaggedStrategy } from './utils/strategyTagging';
import { ContainerContext } from '../container/ContainerContext';

export class TransientStrategy<TValue> extends BuildStrategy<TValue> {
  readonly strategyTag = transientStrategyTag;

  build(id: string, context: ContainerContext, materializedModule): TValue {
    const result = this.buildFunction(materializedModule);
    if (result instanceof Instance) {
      return result.build(id, context, materializedModule);
    }
    return result;
  }
}

export const transientStrategyTag = Symbol();

export const transient = buildTaggedStrategy(
  <TReturn>(buildFunction: (ctx) => TReturn) => new TransientStrategy(buildFunction),
  transientStrategyTag,
);
