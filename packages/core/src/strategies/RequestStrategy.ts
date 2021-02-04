import { ContainerContext } from '../container/ContainerContext';
import { BuildStrategy } from './abstract/BuildStrategy';
import { Instance } from '../resolvers/abstract/Instance';

export class RequestStrategy<TValue> extends BuildStrategy<TValue> {
  build(id: string, context: ContainerContext, materializedModule): TValue {


    if (context.hasInRequestScope(id)) {
      return context.getFromRequestScope(id);
    } else {
      const instanceOrStrategy = this.buildFunction(materializedModule);

      if (instanceOrStrategy instanceof Instance) {
        return instanceOrStrategy.build(id, context, materializedModule);
      }

      context.setForRequestScope(id, instanceOrStrategy);
      return instanceOrStrategy;
    }
  }
}

export const request = <TReturn>(buildFunction: (ctx) => TReturn) => {
  return new RequestStrategy(buildFunction);
};
