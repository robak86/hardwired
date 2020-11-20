import { AbstractDependencyResolver } from './abstract/AbstractDependencyResolver';
import { ContainerContext } from '../container/ContainerContext';
import { ClassType } from '../utils/ClassType';
import { Instance } from "./abstract/Instance";

export class ClassSingletonResolver<TReturn> extends AbstractDependencyResolver<TReturn> {
  constructor(private klass, private selectDependencies: Array<Instance<any>> = []) {
    super();
  }

  build(cache: ContainerContext): TReturn {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      const constructorArgs = this.selectDependencies.map(factory => factory.get(cache));
      const instance = new this.klass(...constructorArgs);
      cache.setForGlobalScope(this.id, instance);
      return instance;
    }
  }
}

export type ClassSingletonBuilder = {
  <TResult>(klass: ClassType<[], TResult>): ClassSingletonResolver<TResult>;
  <TDeps extends any[], TResult>(
    klass: ClassType<TDeps, TResult>,
    depSelect: { [K in keyof TDeps]: Instance<TDeps[K]> },
  ): ClassSingletonResolver<TResult>;
};

export const singleton: ClassSingletonBuilder = (klass, depSelect?) => {
  return new ClassSingletonResolver(klass, depSelect);
};
