import {  ModuleRegistry } from '@hardwired/di-core';
import { SingletonResolver } from '@hardwired/di';


export class SagaFactory<TRegistry extends ModuleRegistry, TReturn> extends SingletonResolver<TRegistry, TReturn> {
  public type = 'saga';
}

