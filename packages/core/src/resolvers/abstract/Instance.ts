import { createResolverId } from '../../utils/fastId';
import { ContainerContext } from '../../container/ContainerContext';
import { AnyResolver } from './Module';

export namespace Instance {
  export type Unbox<T> = T extends Instance<infer TInstance, any>
    ? TInstance
    : 'Cannot unbox instance type from Instance';
}

export type DepsResolvers<T> = { [K in keyof T]: AnyResolver };

export abstract class Instance<TValue, TDeps extends any[]> {
  kind: 'instanceResolver' = 'instanceResolver';

  protected dependencies: Instance<any, any>[] = [];
  private _isInitialized = false;

  protected constructor(public readonly id: string = createResolverId()) {}

  abstract build(context: ContainerContext): TValue;

  onInit?(context: ContainerContext, dependenciesIds: string[]): void;

  private __keep(t: TDeps) {}

  setDependencies(instances: Instance<any, any>[]) {
    this.dependencies = instances;
    this._isInitialized = true;
  }
  get isInitialized(): boolean {
    return this._isInitialized;
  }
}
