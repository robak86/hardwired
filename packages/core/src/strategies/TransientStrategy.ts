import { BuildStrategy } from '../resolvers/abstract/BuildStrategy';

import { InstancesCache } from '../context/InstancesCache';

export class TransientStrategy<TValue> extends BuildStrategy<TValue> {
  constructor(protected buildFunction: (ctx) => TValue) {
    super();
  }

  build(id: string, context: InstancesCache, resolvers, materializedModule?): TValue {
    const result = this.buildFunction(materializedModule);
    if (result instanceof BuildStrategy) {
      return result.build(id, context, materializedModule);
    }
    return result;
  }
}

export const transient = <TReturn>(buildFunction: (ctx) => TReturn) => new TransientStrategy(buildFunction);
