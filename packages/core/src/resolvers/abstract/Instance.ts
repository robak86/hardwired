import { ContainerContext } from '../../container/ContainerContext';
import { ContextRecord } from '../../container/ContainerContextStorage';

export namespace Instance {
  export type Unbox<T> = T extends Instance<infer TInstance> ? TInstance : 'Cannot unbox instance type from Instance';
}

export abstract class Instance<TValue> {
  // make sure that generic types won't be erased
  readonly __TValue!: TValue;
  readonly strategyTag: symbol | undefined;
  readonly tags: symbol[] = [];

  abstract build(id: string, context: ContextRecord, materializedModule?): TValue;
}
