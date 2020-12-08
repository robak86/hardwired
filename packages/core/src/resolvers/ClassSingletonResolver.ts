import { ContainerContext } from "../container/ContainerContext";
import { ClassType } from "../utils/ClassType";
import { Instance } from "./abstract/AbstractResolvers";

export class ClassSingletonResolver<TReturn, TDeps extends any[]> extends Instance<TReturn, TDeps> {
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
): Instance<TValue, TDeps> {
  return new ClassSingletonResolver(cls);
}
