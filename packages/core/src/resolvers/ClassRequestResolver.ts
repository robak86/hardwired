import { ContainerContext } from '../container/ContainerContext';
import { ClassType } from '../utils/ClassType';
import { Instance } from './abstract/Instance';

export class ClassRequestResolver<TReturn, TDeps extends any[]> extends Instance<TReturn, TDeps> {
  constructor(private klass) {
    super();
  }

  build(context: ContainerContext): TReturn {
    if (context.hasInRequestScope(this.id)) {
      return context.getFromRequestScope(this.id);
    } else {
      const dependencies = context.getDependencies(this.id);
      const args = dependencies.map(d => d.build(context));
      const instance = new this.klass(...args);
      context.setForRequestScope(this.id, instance);
      return instance;
    }
  }
}

export function request<TDeps extends any[], TValue>(cls: ClassType<TValue, TDeps>): Instance<TValue, TDeps> {
  return new ClassRequestResolver(cls);
}
