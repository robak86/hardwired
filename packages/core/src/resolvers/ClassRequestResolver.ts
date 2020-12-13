import { ContainerContext } from "../container/ContainerContext";
import { ClassType } from "../utils/ClassType";
import { Instance } from "./abstract/Instance";

export class ClassRequestResolver<TReturn, TDeps extends any[]> extends Instance<TReturn, TDeps> {
  constructor(private klass) {
    super();
  }

  build(cache: ContainerContext, _: TDeps): TReturn {
    if (cache.hasInRequestScope(this.id)) {
      return cache.getFromRequestScope(this.id);
    } else {
      const args = this.dependencies.map(d => d.build(cache, []));
      const instance = new this.klass(...args);
      cache.setForRequestScope(this.id, instance);
      return instance;
    }
  }
}

export function request<TDeps extends any[], TValue>(
  cls: ClassType<TDeps, TValue>,
): Instance<TValue, TDeps> {
  return new ClassRequestResolver(cls);
}
