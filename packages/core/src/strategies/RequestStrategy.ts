import { ContainerContext } from '../container/ContainerContext';
import { BuildStrategy } from './abstract/BuildStrategy';

export class RequestStrategy<TValue> extends BuildStrategy<TValue> {
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

export const request = <TReturn>(buildFunction: (ctx) => TReturn) => {
  return new RequestStrategy(buildFunction);
};
