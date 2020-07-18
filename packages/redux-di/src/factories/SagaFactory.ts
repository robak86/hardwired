import { SingletonResolver, ModuleRegistry } from '@hardwired/di-core';

export class SagaFactory<TRegistry extends ModuleRegistry, TReturn> extends SingletonResolver<TRegistry, TReturn> {
  public type = 'saga';
}

