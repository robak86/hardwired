import { BuildStrategy } from './abstract/BuildStrategy';
import { ContainerContext } from '../container/ContainerContext';

export class TransientStrategy<TValue> extends BuildStrategy<TValue> {
  build(context: ContainerContext, materializedModule): TValue {
    return this.buildFunction(materializedModule);
  }
}

export const transient = <TReturn>(buildFunction: (ctx) => TReturn) => {
  return new TransientStrategy(buildFunction);
};
