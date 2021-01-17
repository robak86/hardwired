import { ContainerContext } from '../container/ContainerContext';
import { ClassType } from '../utils/ClassType';
import { Instance } from './abstract/Instance';

export interface Factory<TReturn> {
  build(): TReturn;
}

export class FactoryResolver<TReturn, TDeps extends any[]> extends Instance<TReturn, TDeps> {
  constructor(private klass: ClassType<Factory<TReturn>, any>) {
    super();
  }

  build(context: ContainerContext): TReturn {
    if (context.hasInGlobalScope(this.id)) {
      return context.getFromGlobalScope(this.id);
    } else {
      const dependencies = context.getDependencies(this.id);
      const args = dependencies.map(d => d.build(context));
      const factory = new this.klass(...args);
      const instance = factory.build();
      context.setForGlobalScope(this.id, instance);
      return instance;
    }
  }
}

export function factory<TDeps extends any[], TValue>(cls: ClassType<Factory<TValue>, TDeps>): Instance<TValue, TDeps> {
  return new FactoryResolver(cls) as any;
}
