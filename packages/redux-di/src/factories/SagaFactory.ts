import { SingletonResolver, ModuleRegistry } from '@hardwired/di';

export class SagaFactory<TRegistry extends ModuleRegistry, TReturn> extends SingletonResolver<TRegistry, TReturn> {
  public type = 'saga';
}

