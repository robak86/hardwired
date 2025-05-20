import prettyMilliseconds from 'pretty-ms';

import type { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import type { IInterceptor } from '../interceptor.js';
import { isThenable } from '../../../utils/IsThenable.js';
import type { IInstancesStoreRead } from '../../../context/InstancesStore.js';
import type { IBindingRegistryRead } from '../../../context/BindingsRegistry.js';
import type { IDefinition } from '../../../definitions/abstract/IDefinition.js';

export class LoggingInterceptor<T> implements IInterceptor<T> {
  static create() {
    return new LoggingInterceptor();
  }

  private _start?: number;

  private constructor(
    private _parent?: LoggingInterceptor<unknown>,
    private _definition?: IDefinition<T, LifeTime>,
    private _instances?: IInstancesStoreRead,
    private _scopeLevel = 0,
  ) {}

  get definition(): IDefinition<T, LifeTime> {
    if (!this._definition) {
      throw new Error(`No definition associated with the graph node`);
    }

    return this._definition;
  }

  private onDependencyInstanceCreated<TInstance>(
    definition: IDefinition<TInstance, any>,
    instance: TInstance,
    endTime: number,
  ) {
    console.log(
      `Returning[${this.scopeLevel}][${definition.strategy}][${prettyMilliseconds(endTime - this._start!, { formatSubMilliseconds: true, compact: true })}]:`,
      instance,
    );
  }

  onEnter<TNewInstance>(dependencyDefinition: IDefinition<TNewInstance, LifeTime>): IInterceptor<TNewInstance> {
    if (this.hasCached(dependencyDefinition.id)) {
      console.group(
        `Fetching cached[${this.scopeLevel}][${dependencyDefinition.strategy}]: ${dependencyDefinition.toString()}`,
      );
    } else {
      console.group(
        `Creating[${this.scopeLevel}][${dependencyDefinition.strategy}]: ${dependencyDefinition.toString()}`,
      );
    }

    this._start = performance.now();

    return new LoggingInterceptor(this, dependencyDefinition, this._instances, this._scopeLevel);
  }

  get scopeLevel() {
    return `S${this._scopeLevel}`;
  }

  onScope(
    tags: string[],
    bindingsRegistry: IBindingRegistryRead,
    instancesStore: IInstancesStoreRead,
  ): IInterceptor<T> {
    const newScopeLevel = this._scopeLevel + 1;

    console.log(`Creating new scope: S${newScopeLevel}`);

    return new LoggingInterceptor(this, this._definition, instancesStore, newScopeLevel);
  }

  onLeave(instance: T, definition: IDefinition<T, any>): T {
    if (isThenable(instance)) {
      void instance.then(instanceAwaited => {
        console.groupEnd();

        return this._parent?.onDependencyInstanceCreated?.(definition, instanceAwaited, performance.now());
      });
    } else {
      console.groupEnd();

      this._parent?.onDependencyInstanceCreated?.(definition, instance, performance.now());
    }

    return instance;
  }

  protected hasCached(definitionId: symbol): boolean {
    return (
      (this._instances?.hasRootInstance(definitionId) || this._instances?.hasScopedInstance(definitionId)) ?? false
    );
  }
}
