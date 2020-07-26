import { RegistryRecord } from '@hardwired/di-core';
import { SingletonResolver } from '@hardwired/di';

export class ReducerFactory<TRegistryRecord extends RegistryRecord, TReturn> extends SingletonResolver<TRegistryRecord, TReturn> {
  public type = 'reducer';
}
