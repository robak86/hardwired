import { buildTaggedStrategy } from './utils/strategyTagging';
import { ContainerContext } from '../context/ContainerContext';
import { ContextLookup } from '../context/ContextLookup';
import { ContextMutations } from '../context/ContextMutations';
import { BuildStrategy } from '../resolvers/abstract/BuildStrategy';

export class RequestStrategy<TValue> extends BuildStrategy<TValue> {
  readonly strategyTag = requestStrategyTag;
  constructor(protected buildFunction: (ctx) => TValue) {
    super();
  }

  build(id: string, context: ContainerContext, materializedModule): TValue {
    if (ContextLookup.hasInRequestScope(id, context)) {
      return ContextLookup.getFromRequestScope(id, context);
    } else {
      const instance = this.buildFunction(materializedModule);
      ContextMutations.setForRequestScope(id, instance, context);
      return instance;
    }
  }
}

export const requestStrategyTag = Symbol();

export const request = buildTaggedStrategy(
  <TReturn>(buildFunction: (ctx) => TReturn) => new RequestStrategy(buildFunction),
  requestStrategyTag,
);
