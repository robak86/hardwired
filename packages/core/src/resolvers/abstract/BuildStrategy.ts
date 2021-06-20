import { ContainerContext } from '../../context/ContainerContext';

export namespace BuildStrategy {
  export type Unbox<T> = T extends BuildStrategy<infer TInstance>
    ? TInstance
    : 'Cannot unbox instance type from Instance';
}

export abstract class BuildStrategy<TValue> {
  readonly __TValue!: TValue; // prevent generic type erasure
  readonly strategyTag: symbol | undefined;
  readonly tags: symbol[] = [];

  abstract build(id: string, context: ContainerContext, materializedModule?): TValue;
}
