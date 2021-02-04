import { ContainerContext } from '../container/ContainerContext';
import { BuildStrategy } from './abstract/BuildStrategy';
import { Instance } from '../resolvers/abstract/Instance';

export class SingletonStrategy<TValue> extends BuildStrategy<TValue> {
  build(id: string, context: ContainerContext, materializedModule): TValue {
    if (context.hasInGlobalScope(id)) {
      return context.getFromGlobalScope(id);
    } else {
      const instanceOrStrategy = this.buildFunction(materializedModule);

      if (instanceOrStrategy instanceof Instance) {
        return instanceOrStrategy.build(id, context, materializedModule);
      }

      context.setForGlobalScope(id, instanceOrStrategy);
      return instanceOrStrategy;
    }
  }
}

export const singleton = <TReturn>(buildFunction: (ctx) => TReturn) => {
  return new SingletonStrategy(buildFunction);
};
