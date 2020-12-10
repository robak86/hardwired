import { ContainerContext } from "../container/ContainerContext";
import { ClassType } from "../utils/ClassType";
import { Instance } from "./abstract/Instance";

export interface Factory<TReturn> {
  build(): TReturn;
}

export class FactoryResolver<TReturn, TDeps extends any[]> extends Instance<TReturn, TDeps> {
  constructor(private klass: ClassType<any, Factory<TReturn>>) {
    super();
  }

  build(cache: ContainerContext, deps): TReturn {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      const factory = new this.klass(...deps);
      const instance = factory.build();
      cache.setForGlobalScope(this.id, instance);
      return instance;
    }
  }
}

export function factory<TDeps extends any[], TValue>(
  cls: ClassType<TDeps, Factory<TValue>>,
): Instance<TValue, TDeps> {
  return new FactoryResolver(cls);
}
