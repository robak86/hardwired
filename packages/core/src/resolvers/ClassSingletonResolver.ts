import { ContainerContext } from "../container/ContainerContext";
import { ClassType } from "../utils/ClassType";
import { AbstractInstanceResolver } from "./abstract/AbstractResolvers";

export class ClassSingletonResolver<TReturn, TDeps extends any[]> extends AbstractInstanceResolver<TReturn, TDeps> {
  constructor(private klass) {
    super();
  }

  build(cache: ContainerContext, deps): TReturn {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      const instance = new this.klass(...deps);
      cache.setForGlobalScope(this.id, instance);
      return instance;
    }
  }
}

export function singleton<TDeps extends any[], TValue>(
  cls: ClassType<TDeps, TValue>,
): ClassSingletonResolver<TValue, TDeps> {
  return new ClassSingletonResolver(cls);
}
