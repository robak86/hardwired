import { AbstractDependencyResolver } from "./AbstractDependencyResolver";
import { ClassSingletonResolver } from "./ClassSingletonResolver";
import { ContainerContext } from "../container/ContainerContext";
import { DependencyFactory } from "../module/RegistryRecord";
import { ClassType } from "../utils/ClassType";

export interface Factory<TReturn> {
  build(): TReturn;
}

export class FactoryResolver<TReturn extends Factory<any>> extends AbstractDependencyResolver<TReturn> {
  private factoryResolver: ClassSingletonResolver<Factory<any>>;

  constructor(private klass, private selectDependencies: Array<DependencyFactory<any>> = []) {
    super();
    this.factoryResolver = new ClassSingletonResolver(klass, selectDependencies);
  }

  build(cache: ContainerContext): TReturn {
    const factory = this.factoryResolver.build(cache);
    return factory.build();
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
