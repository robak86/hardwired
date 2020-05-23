import { SingletonResolver, ModuleRegistry } from '@hardwired/di';

export class ReducerFactory<TRegistry extends ModuleRegistry, TReturn> extends SingletonResolver<TRegistry, TReturn> {
  public type = 'reducer';
}
