import { BuildStrategy } from '../resolvers/abstract/BuildStrategy';
import { InstancesCache } from '../context/InstancesCache';

export class SingletonStrategy<TValue> extends BuildStrategy<TValue> {
  constructor(protected buildFunction: (ctx) => TValue) {
    super();
  }

  build(id: string, context: InstancesCache, resolvers, materializedModule?): TValue {
    if (context.hasInGlobalScope(id)) {
      return context.getFromGlobalScope(id);
    } else {
      const instance = this.buildFunction(materializedModule);
      context.setForGlobalScope(id, instance);
      return instance;
    }
  }
}

export const singleton = <TReturn>(buildFunction: (ctx) => TReturn) => new SingletonStrategy(buildFunction);
