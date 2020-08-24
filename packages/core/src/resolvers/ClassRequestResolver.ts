import { AbstractDependencyResolver } from "./AbstractDependencyResolver";
import { ContainerContext } from "../container/ContainerContext";
import { ClassType } from "../utils/ClassType";
import { DependencyFactory } from "../module/RegistryRecord";

export class ClassRequestResolver<TReturn> extends AbstractDependencyResolver<TReturn> {
  constructor(private klass, private selectDependencies: Array<DependencyFactory<any>> = []) {
    super();
  }

  build(cache: ContainerContext): TReturn {
    if (cache.hasInRequestScope(this.id)) {
      return cache.getFromRequestScope(this.id);
    } else {
      const constructorArgs = this.selectDependencies.map(factory => factory(cache));
      const instance = new this.klass(...constructorArgs);
      cache.setForRequestScope(this.id, instance);
      return instance;
    }
  }
}

export type ClassRequestBuilder = {
  <TResult>(klass: ClassType<[], TResult>): ClassRequestResolver<TResult>;
  <TDeps extends any[], TResult>(
    klass: ClassType<TDeps, TResult>,
    depSelect: { [K in keyof TDeps]: (container: ContainerContext) => TDeps[K] },
  ): ClassRequestResolver<TResult>;
};

export const request: ClassRequestBuilder = (klass, depSelect?) => {
  return new ClassRequestResolver(klass, depSelect);
};
