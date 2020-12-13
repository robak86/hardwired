import { createResolverId } from '../../utils/fastId';
import { ContainerContext } from '../../container/ContainerContext';
import { MaterializedRecord, Module } from './Module';
import { InstanceEvents } from '../../container/InstanceEvents';

export namespace Instance {
  export type Unbox<T> = T extends Instance<infer TInstance, any>
    ? TInstance
    : 'Cannot unbox instance type from Instance';
}

export abstract class Instance<TValue, TDeps extends any[]> {
  kind: 'instanceResolver' = 'instanceResolver';

  protected dependencies: Instance<any, any>[] = [];
  private _isInitialized = false;

  protected constructor(public readonly id: string = createResolverId()) {}

  abstract build(context: ContainerContext): TValue;

  acquire(context: ContainerContext): AcquiredInstance<TValue> {
    return new GenericAcquiredInstance(this.id, context, this.build);
  }

  onInit?(context: ContainerContext, dependenciesIds: string[]): void;

  private __keep(t: TDeps) {} // prevent erasing of the TDeps

  setDependencies(instances: Instance<any, any>[]) {
    this.dependencies = instances;
    this._isInitialized = true;
  }
  get isInitialized(): boolean {
    return this._isInitialized;
  }
}

// TODO: does this object allow for keeping state, listeners, events ??
export abstract class AcquiredInstance<TValue> {
  protected constructor(protected resolverId: string, protected containerContext: ContainerContext) {}
  abstract get(): TValue;

  // TODO: use loan pattern ? but how to fit this with other concepts ?
  dispose() {}

  getEvents<
    TRegistryRecord extends Module.EntriesRecord,
    K extends keyof MaterializedRecord<TRegistryRecord> & string
  >(): InstanceEvents {
    return this.containerContext.getInstancesEvents(this.resolverId);
  }
}

export class GenericAcquiredInstance<TValue> extends AcquiredInstance<TValue> {
  constructor(resolverId: string, context: ContainerContext, protected _build: (context: ContainerContext) => TValue) {
    super(resolverId, context);
  }

  get(): TValue {
    return this._build(this.containerContext);
  }
}
