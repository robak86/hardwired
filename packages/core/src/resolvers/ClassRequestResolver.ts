import { AbstractDependencyResolver } from './abstract/AbstractDependencyResolver';
import { ContainerContext } from '../container/ContainerContext';
import { ClassType } from '../utils/ClassType';
import { Instance } from './abstract/Instance';
import { AbstractInstanceResolver } from '../module/ModuleBuilder';
import { ClassTransientResolverNew } from "./ClassTransientResolver";

export class ClassRequestResolver<TReturn> extends AbstractDependencyResolver<TReturn> {
  constructor(private klass, private selectDependencies: Array<Instance<any>> = []) {
    super();
  }

  build(cache: ContainerContext): TReturn {
    if (cache.hasInRequestScope(this.id)) {
      return cache.getFromRequestScope(this.id);
    } else {
      const constructorArgs = this.selectDependencies.map(factory => factory.get(cache));
      const instance = new this.klass(...constructorArgs);
      cache.setForRequestScope(this.id, instance);
      return instance;
    }
  }
}

export class ClassRequestResolverNew<TReturn, TDeps extends any[]> extends AbstractInstanceResolver<TReturn, TDeps> {
  constructor(private klass) {
    super();
  }

  build(cache: ContainerContext, deps: TDeps): TReturn {
    if (cache.hasInRequestScope(this.id)) {
      return cache.getFromRequestScope(this.id);
    } else {
      const instance = new this.klass(...deps);
      cache.setForRequestScope(this.id, instance);
      return instance;
    }
  }
}

export type ClassRequestBuilder = {
  <TResult>(klass: ClassType<[], TResult>): ClassRequestResolver<TResult>;
  <TDeps extends any[], TResult>(
    klass: ClassType<TDeps, TResult>,
    depSelect: { [K in keyof TDeps]: Instance<TDeps[K]> },
  ): ClassRequestResolver<TResult>;
};

export const request: ClassRequestBuilder = (klass, depSelect?) => {
  return new ClassRequestResolver(klass, depSelect);
};

export function requestNew<TDeps extends any[], TValue>(
  cls: ClassType<TDeps, TValue>,
): ClassRequestResolverNew<TValue, TDeps> {
  return new ClassRequestResolverNew(cls);
}
