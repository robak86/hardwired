import { ContainerContext } from '../container/ContainerContext';
import { BuildStrategy } from './abstract/BuildStrategy';

export class SingletonStrategy<TValue> extends BuildStrategy<TValue> {
  build(context: ContainerContext, materializedModule): TValue {
    if (context.hasInGlobalScope(this.id)) {
      return context.getFromGlobalScope(this.id);
    } else {
      const instance = this.buildFunction(materializedModule);
      context.setForGlobalScope(this.id, instance);
      return instance;
    }
  }
}

export const singleton = <TReturn>(buildFunction: (ctx) => TReturn) => {
  return new SingletonStrategy(buildFunction);
};
