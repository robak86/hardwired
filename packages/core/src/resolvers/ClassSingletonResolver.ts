import { ContainerContext } from '../container/ContainerContext';
import { ClassType } from '../utils/ClassType';
import { Instance } from './abstract/Instance';

export class ClassSingletonResolver<TReturn, TDeps extends any[]> extends Instance<TReturn, TDeps> {
  constructor(private klass) {
    super();
  }

  build(cache: ContainerContext): TReturn {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      const args = this.dependencies.map(d => d.build(cache));
      const instance = new this.klass(...args);
      cache.setForGlobalScope(this.id, instance);
      return instance;
    }
  }
}

export function singleton<TDeps extends any[], TValue>(cls: ClassType<TValue, TDeps>): Instance<TValue, TDeps> {
  return new ClassSingletonResolver(cls);
}
