import { BuildStrategy } from '../resolvers/abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';

export class RequestStrategy<TValue> extends BuildStrategy<TValue> {
  constructor(protected buildFunction: (ctx) => TValue) {
    super();
  }

  build(id: string, context: InstancesCache, materializedModule?): TValue {
    if (context.hasInRequestScope(id)) {
      return context.getFromRequestScope(id);
    } else {
      const instance = this.buildFunction(materializedModule);
      context.setForRequestScope(id, instance);
      return instance;
    }
  }
}

export const request = <TReturn>(buildFunction: (ctx) => TReturn) => new RequestStrategy(buildFunction);
