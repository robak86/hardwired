import { createResolverId } from '../../utils/fastId';
import { ContainerContext } from '../../container/ContainerContext';

export enum Scope {
  singleton = 'singleton',
  transient = 'transient',
  request = 'request',
}

export namespace Instance {
  export type Unbox<T> = T extends Instance<infer TInstance> ? TInstance : 'Cannot unbox instance type from Instance';
}

export abstract class Instance<TValue> {
  // make sure that generic types won't be erased
  readonly __TValue!: TValue;

  protected constructor(public readonly id: string = createResolverId()) {}

  abstract build(id: string, context: ContainerContext, materializedModule?): TValue;
}
