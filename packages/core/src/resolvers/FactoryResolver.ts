import { ContainerContext } from '../container/ContainerContext';
import { ClassType } from '../utils/ClassType';
import { Instance } from './abstract/Instance';
import invariant from 'tiny-invariant';

export interface Factory<TReturn> {
  build(): TReturn;
}

export class FactoryResolver<TReturn, TDeps extends any[]> extends Instance<TReturn, TDeps> {
  constructor(private klass: ClassType<Factory<TReturn>, any>) {
    super();
  }

  build(cache: ContainerContext): TReturn {
    invariant(this.isInitialized, `Resolver is not initialized`);

    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      const args = this.dependencies.map(d => d.build(cache));
      const factory = new this.klass(...args);
      const instance = factory.build();
      cache.setForGlobalScope(this.id, instance);
      return instance;
    }
  }
}

export function factory<TDeps extends any[], TValue>(cls: ClassType<Factory<TValue>, TDeps>): Instance<TValue, TDeps> {
  return new FactoryResolver(cls) as any;
}
