import { BuildStrategy } from './abstract/BuildStrategy';
import { ContainerContext } from '../container/ContainerContext';
import { Instance } from '../resolvers/abstract/Instance';

export class TransientStrategy<TValue> extends BuildStrategy<TValue> {
  build(id: string, context: ContainerContext, materializedModule): TValue {
    const result = this.buildFunction(materializedModule);
    if (result instanceof Instance) {
      return result.build(id, context, materializedModule);
    }
    return result;
  }
}

export const transient = <TReturn>(buildFunction: (ctx) => TReturn) => {
  return new TransientStrategy(buildFunction);
};
