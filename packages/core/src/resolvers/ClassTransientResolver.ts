import { ContainerContext } from '../container/ContainerContext';
import { ClassType } from '../utils/ClassType';
import { Instance } from './abstract/Instance';

export class ClassTransientResolver<TReturn, TDeps extends any[]> extends Instance<TReturn, TDeps> {
  constructor(private klass) {
    super();
  }

  build(context: ContainerContext): TReturn {
    const dependencies = context.getDependencies(this.id);
    const args = dependencies.map(d => d.build(context));
    return new this.klass(...args);
  }
}

export function transient<TDeps extends any[], TValue>(cls: ClassType<TValue, TDeps>): Instance<TValue, TDeps> {
  return new ClassTransientResolver(cls);
}
