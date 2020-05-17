import { GlobalSingletonResolver, ModuleRegistry } from '@hardwired/di';

export class ReducerFactory<TRegistry extends ModuleRegistry, TReturn> extends GlobalSingletonResolver<TRegistry, TReturn> {
  public type = 'reducer';
}
