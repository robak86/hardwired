import { ContainerContext } from '../container/ContainerContext';
import { BuildStrategy } from './abstract/BuildStrategy';
import { buildTaggedStrategy } from './utils/strategyTagging';

export class RequestStrategy<TValue> extends BuildStrategy<TValue> {
  readonly strategyTag = requestStrategyTag;

  build(id: string, context: ContainerContext, materializedModule): TValue {
    if (context.hasInRequestScope(id)) {
      return context.getFromRequestScope(id);
    } else {
      const instance = this.buildFunction(materializedModule);
      context.setForRequestScope(id, instance);
      return instance;
    }
  }
}

export const requestStrategyTag = Symbol();

export const request = buildTaggedStrategy(
  <TReturn>(buildFunction: (ctx) => TReturn) => new RequestStrategy(buildFunction),
  requestStrategyTag,
);
