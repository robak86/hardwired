import { ContainerContext } from "../container/ContainerContext";
import { ClassType } from "../utils/ClassType";
import { Instance } from "./abstract/Instance";

export class ClassTransientResolver<TReturn, TDeps extends any[]> extends Instance<TReturn, TDeps> {
  constructor(private klass) {
    super();
  }

  build(cache: ContainerContext): TReturn {
    const args = this.dependencies.map(d => d.build(cache));
    return new this.klass(...args);
  }
}


export function transient<TDeps extends any[], TValue>(
  cls: ClassType<TDeps, TValue>,
): Instance<TValue, TDeps> {
  return new ClassTransientResolver(cls);
}
