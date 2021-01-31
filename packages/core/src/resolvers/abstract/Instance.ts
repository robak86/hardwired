import { createResolverId } from '../../utils/fastId';
import { ContainerContext } from '../../container/ContainerContext';

export enum Scope {
  singleton = 'singleton',
  transient = 'transient',
  request = 'request',
}

export namespace Instance {
  export type Unbox<T> = T extends Instance<infer TInstance, any>
    ? TInstance
    : 'Cannot unbox instance type from Instance';
}

export abstract class Instance<TValue, TDeps extends any[]> {
  readonly __kind: 'instanceResolver' = 'instanceResolver';

  // make sure that generic types won't be erased
  readonly __TValue!: TValue;
  readonly __TDeps!: TDeps;

  protected constructor(public readonly id: string = createResolverId()) {}

  abstract build(context: ContainerContext, materializedModule?): TValue;
}
