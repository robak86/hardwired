import { AbstractDependencyResolver } from './abstract/AbstractDependencyResolver';
import { ContainerContext } from '../container/ContainerContext';
import { ClassType } from '../utils/ClassType';
import { Instance } from "./abstract/Instance";

export interface Factory<TReturn> {
  build(): TReturn;
}

export class FactoryResolver<TReturn> extends AbstractDependencyResolver<TReturn> {
  constructor(
    private klass: ClassType<any, Factory<TReturn>>,
    private selectDependencies: Array<Instance<any>> = [],
  ) {
    super();
  }

  build(cache: ContainerContext): TReturn {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      const constructorArgs = this.selectDependencies.map(factory => factory.get(cache));
      const factory = new this.klass(...constructorArgs);
      const instance = factory.build();
      cache.setForGlobalScope(this.id, instance);
      return instance;
    }
  }
}

export type ClassFactoryBuilder = {
  <TResult>(klass: ClassType<[], Factory<TResult>>): FactoryResolver<TResult>;
  <TDeps extends any[], TResult>(
    klass: ClassType<TDeps, Factory<TResult>>,
    depSelect: { [K in keyof TDeps]: Instance<TDeps[K]> },
  ): FactoryResolver<TResult>;
};

export const factory: ClassFactoryBuilder = (klass, depSelect?) => {
  return new FactoryResolver(klass, depSelect);
};
