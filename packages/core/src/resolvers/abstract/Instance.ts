import { ContainerContext } from '../../container/ContainerContext';

export namespace Instance {
  export type Unbox<T> = T extends Instance<infer TInstance> ? TInstance : 'Cannot unbox instance type from Instance';
}

export abstract class Instance<TValue> {
  // make sure that generic types won't be erased
  readonly __TValue!: TValue;

  abstract build(id: string, context: ContainerContext, materializedModule?): TValue;
}
