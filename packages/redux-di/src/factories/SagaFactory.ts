import { GlobalSingletonResolver, ModuleRegistry } from '@hardwired/di';

export class SagaFactory<TRegistry extends ModuleRegistry, TReturn> extends GlobalSingletonResolver<TRegistry, TReturn> {
  public type = 'reducer';
}

