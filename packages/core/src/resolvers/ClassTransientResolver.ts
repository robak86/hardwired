import { AbstractDependencyResolver } from './abstract/AbstractDependencyResolver';
import { ContainerContext } from '../container/ContainerContext';
import { ClassType } from '../utils/ClassType';
import { Instance } from './abstract/Instance';
import { AbstractInstanceResolver } from '../module/ModuleBuilder';
import { ClassSingletonResolverNew } from "./ClassSingletonResolver";

export class ClassTransientResolver<TReturn> extends AbstractDependencyResolver<TReturn> {
  constructor(private klass, private selectDependencies: Array<Instance<any>> = []) {
    super();
  }

  build(cache: ContainerContext): TReturn {
    const constructorArgs = this.selectDependencies.map(factory => factory.get(cache));
    return new this.klass(...constructorArgs);
  }
}

export class ClassTransientResolverNew<TReturn, TDeps extends any[]> extends AbstractInstanceResolver<TReturn, TDeps> {
  constructor(private klass) {
    super();
  }

  build(cache: ContainerContext, deps): TReturn {
    return new this.klass(...deps);
  }
}

export type ClassTransientBuilder = {
  <TResult>(klass: ClassType<[], TResult>): ClassTransientResolver<TResult>;
  <TDeps extends any[], TResult>(
    klass: ClassType<TDeps, TResult>,
    depSelect: { [K in keyof TDeps]: Instance<TDeps[K]> },
  ): ClassTransientResolver<TResult>;
};

export const transient: ClassTransientBuilder = (klass, depSelect?) => {
  return new ClassTransientResolver(klass, depSelect);
};

export function transientNew<TDeps extends any[], TValue>(
  cls: ClassType<TDeps, TValue>,
): ClassTransientResolverNew<TValue, TDeps> {
  return new ClassTransientResolverNew(cls);
}
