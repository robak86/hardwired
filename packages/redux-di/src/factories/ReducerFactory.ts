import { SingletonResolver, ModuleRegistry } from '@hardwired/di-core';

export class ReducerFactory<TRegistry extends ModuleRegistry, TReturn> extends SingletonResolver<TRegistry, TReturn> {
  public type = 'reducer';
}
