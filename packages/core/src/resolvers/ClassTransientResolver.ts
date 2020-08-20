import { AbstractDependencyResolver } from "./AbstractDependencyResolver";
import { ContainerContext } from "../container/ContainerContext";
import { ClassType } from "../utils/ClassType";
import { DependencyFactory } from "../module/RegistryRecord";

export class ClassTransientResolver<TReturn> extends AbstractDependencyResolver<TReturn> {
  constructor(private klass, private selectDependencies: Array<DependencyFactory<any>> = []) {
    super();
  }

  build(cache: ContainerContext): TReturn {
    const constructorArgs = this.selectDependencies.map(factory => factory(cache));
    return new this.klass(...constructorArgs);
  }
}

export type ClassTransientBuilder = {
  <TResult>(klass: ClassType<[], TResult>): ClassTransientResolver<TResult>;
  <TDeps extends any[], TResult>(
    klass: ClassType<TDeps, TResult>,
    depSelect: { [K in keyof TDeps]: (container: ContainerContext) => TDeps[K] },
  ): ClassTransientResolver<TResult>;
};

export const transient: ClassTransientBuilder = (klass, depSelect?) => {
  return new ClassTransientResolver(klass, depSelect);
};