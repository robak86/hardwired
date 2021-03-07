import { ContainerContext } from '../container/ContainerContext';
import { BuildStrategy } from './abstract/BuildStrategy';
import { buildTaggedStrategy } from './utils/strategyTagging';
import { ContextRecord } from '../container/ContainerContextStorage';
import { ContextLookup } from '../container/ContextLookup';
import { ContextMutations } from '../container/ContextMutations';

export class RequestStrategy<TValue> extends BuildStrategy<TValue> {
  readonly strategyTag = requestStrategyTag;

  build(id: string, context: ContextRecord, materializedModule): TValue {
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
