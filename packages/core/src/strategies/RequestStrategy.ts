import { buildTaggedStrategy } from './utils/strategyTagging';
import { ContainerContext } from '../context/ContainerContext';
import { ContextLookup } from '../context/ContextLookup';
import { ContextMutations } from '../context/ContextMutations';
import { Instance } from '../resolvers/abstract/Instance';

export class RequestStrategy<TValue> extends Instance<TValue> {
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
