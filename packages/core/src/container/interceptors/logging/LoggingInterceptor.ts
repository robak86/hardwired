import { Definition } from '../../../definitions/abstract/Definition.js';
import { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import { IInterceptor } from '../interceptor.js';
import { isPromise } from '../../../utils/IsPromise.js';
import prettyMilliseconds from 'pretty-ms';
import { IBindingRegistryRead } from '../../../context/BindingsRegistry.js';
import { IInstancesStoryRead } from '../../../context/InstancesStore.js';

export class LoggingInterceptor<T> implements IInterceptor<T> {
  static create() {
    return new LoggingInterceptor();
  }

  private _start?: number;

  private constructor(
    private _parent?: LoggingInterceptor<unknown>,
    private _definition?: Definition<T, LifeTime, any[]>,
    private _scopeLevel: number = 0,
  ) {}

  get definition(): Definition<T, LifeTime, any[]> {
    if (!this._definition) {
      throw new Error(`No definition associated with the graph node`);
    }

    return this._definition;
  }

  private onDependencyInstanceCreated<TInstance>(
    definition: Definition<TInstance, any, any>,
    instance: TInstance,
    endTime: number,
  ) {
    console.log(
      `Returning[${this.scopeLevel}][${definition.strategy}][${prettyMilliseconds(endTime - this._start!, {formatSubMilliseconds: true, compact: true})}]:`,
      instance,
    );
  }

  onEnter<TNewInstance>(
    dependencyDefinition: Definition<TNewInstance, LifeTime, any[]>,
    args: any[],
    bindings: IBindingRegistryRead,
    instances: IInstancesStoryRead,
  ): IInterceptor<TNewInstance> {
    if (this.hasCached(dependencyDefinition.id, instances)) {
      console.group(
        `Fetching cached[${this.scopeLevel}][${dependencyDefinition.strategy}]: ${dependencyDefinition.name}`,
      );
    } else {
      console.group(`Creating[${this.scopeLevel}][${dependencyDefinition.strategy}]: ${dependencyDefinition.name}`);
    }

    this._start = performance.now();

    return new LoggingInterceptor(this, dependencyDefinition, this._scopeLevel);
  }

  get scopeLevel() {
    return `S${this._scopeLevel}`;
  }

  onScope(): IInterceptor<T> {
    const newScopeLevel = this._scopeLevel + 1;
    console.log(`Creating new scope: S${newScopeLevel}`);
    return new LoggingInterceptor(this, this._definition, newScopeLevel);
  }

  onLeave(
    instance: T,
    definition: Definition<T, any, any>,
    bindings: IBindingRegistryRead,
    instances: IInstancesStoryRead,
  ): T {
    if (isPromise(instance)) {
      instance.then(instanceAwaited => {
        console.groupEnd();

        return this._parent?.onDependencyInstanceCreated?.(definition, instanceAwaited, performance.now());
      });
    } else {
      console.groupEnd();

      this._parent?.onDependencyInstanceCreated?.(definition, instance, performance.now());
    }

    return instance;
  }

  protected hasCached(definitionId: symbol, instances: IInstancesStoryRead): boolean {
    return (
      instances.hasSingleton(definitionId) || instances.hasScoped(definitionId) || instances.hasFrozen(definitionId)
    );
  }
}
