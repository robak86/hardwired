import { AbstractDependencyResolver } from "./AbstractDependencyResolver";
import { ContainerContext } from "../container/ContainerContext";
import { DependencyFactory } from "../module/RegistryRecord";
import { ClassType } from "../utils/ClassType";

export interface Factory<TReturn> {
  build(): TReturn;
}

export class FactoryResolver<TReturn extends Factory<any>> extends AbstractDependencyResolver<TReturn> {
  constructor(private klass, private selectDependencies: Array<DependencyFactory<any>> = []) {
    super();
  }

  build(cache: ContainerContext): TReturn {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      const constructorArgs = this.selectDependencies.map(factory => factory(cache));
      const factory = new this.klass(...constructorArgs);
      const instance = factory.build();
      cache.setForGlobalScope(this.id, instance);
      return instance;
    }
  }
}

export type ClassFactoryBuilder = {
  <TResult extends Factory<any>>(klass: ClassType<[], TResult>): FactoryResolver<TResult>;
  <TDeps extends any[], TResult extends Factory<any>>(
    klass: ClassType<TDeps, TResult>,
    depSelect: { [K in keyof TDeps]: (container: ContainerContext) => TDeps[K] },
  ): FactoryResolver<TResult>;
};

export const factory: ClassFactoryBuilder = (klass, depSelect?) => {
  return new FactoryResolver(klass, depSelect);
};
