import { ContainerContext } from "../container/ContainerContext";
import { ClassType } from "../utils/ClassType";
import { Instance } from "./abstract/AbstractResolvers";

export class ClassRequestResolver<TReturn, TDeps extends any[]> extends Instance<TReturn, TDeps> {
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

export function request<TDeps extends any[], TValue>(
  cls: ClassType<TDeps, TValue>,
): ClassRequestResolver<TValue, TDeps> {
  return new ClassRequestResolver(cls);
}
