import { ContainerContext } from "../container/ContainerContext";
import { ClassType } from "../utils/ClassType";
import { Instance } from "./abstract/AbstractResolvers";

export class ClassTransientResolver<TReturn, TDeps extends any[]> extends Instance<TReturn, TDeps> {
  constructor(private klass) {
    super();
  }

  build(cache: ContainerContext, deps): TReturn {
    return new this.klass(...deps);
  }
}


export function transient<TDeps extends any[], TValue>(
  cls: ClassType<TDeps, TValue>,
): ClassTransientResolver<TValue, TDeps> {
  return new ClassTransientResolver(cls);
}
