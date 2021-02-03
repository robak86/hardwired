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

export const isInstance = (instance: any): instance is Instance<any> => {
  return instance.__kind === 'instanceResolver';
};

export abstract class Instance<TValue> {
  readonly __kind: 'instanceResolver' = 'instanceResolver';

  // make sure that generic types won't be erased
  readonly __TValue!: TValue;

  protected constructor(public readonly id: string = createResolverId()) {}

  abstract build(context: ContainerContext, materializedModule?): TValue;
}
