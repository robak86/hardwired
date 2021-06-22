import { BuildStrategy } from '../resolvers/abstract/BuildStrategy';
import { buildTaggedStrategy } from './utils/strategyTagging';
import { ContainerContext } from '../context/ContainerContext';

export class TransientStrategy<TValue> extends BuildStrategy<TValue> {
  readonly strategyTag = transientStrategyTag;

  constructor(protected buildFunction: (ctx) => TValue) {
    super();
  }

  build(id: string, context: ContainerContext, materializedModule): TValue {
    const result = this.buildFunction(materializedModule);
    if (result instanceof BuildStrategy) {
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
