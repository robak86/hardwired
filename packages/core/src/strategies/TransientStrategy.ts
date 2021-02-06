import { BuildStrategy } from './abstract/BuildStrategy';
import { ContainerContext } from '../container/ContainerContext';
import { Instance } from '../resolvers/abstract/Instance';
import { buildTaggedStrategy } from './utils/strategyTagging';

export class TransientStrategy<TValue> extends BuildStrategy<TValue> {
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
