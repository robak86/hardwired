import { ContainerContext } from '../container/ContainerContext';
import { ClassType } from '../utils/ClassType';
import { Instance, Scope } from './abstract/Instance';

export interface Factory<TReturn> {
  build(): TReturn;
}

export class FactoryResolver<TReturn, TDeps extends any[]> extends Instance<TReturn, TDeps> {
  constructor(private klass: ClassType<Factory<TReturn>, any>, private scope: Scope) {
    super();
  }

  build(context: ContainerContext): TReturn {
    if (this.scope === Scope.transient) {
      const dependencies = context.getDependencies(this.id);
      const args = dependencies.map(d => d.build(context));
      const factory = new this.klass(...args);
      return factory.build();
    }

    if (this.scope === Scope.singleton) {
      if (context.hasInGlobalScope(this.id)) {
        return context.getFromGlobalScope(this.id);
      } else {
        const dependencies = context.getDependencies(this.id);
        const args = dependencies.map(d => d.build(context));
        const factory = new this.klass(...args);
        const instance = factory.build();
        context.setForGlobalScope(this.id, instance);
        return instance;
      }
    }

    if (this.scope === Scope.request) {
      if (context.hasInRequestScope(this.id)) {
        return context.getFromRequestScope(this.id);
      } else {
        const dependencies = context.getDependencies(this.id);
        const args = dependencies.map(d => d.build(context));
        const factory = new this.klass(...args);
        const instance = factory.build();
        context.setForRequestScope(this.id, instance);
        return instance;
      }
    }

    throw new Error('Wrong scope')
  }
}

export function factory<TDeps extends any[], TValue>(
  cls: ClassType<Factory<TValue>, TDeps>,
  scope: Scope = Scope.singleton,
): Instance<TValue, TDeps> {
  return new FactoryResolver(cls, scope) as any;
}
