import { IBindingRegistryRead } from '../../../context/BindingsRegistry.js';
import { IInstancesStoryRead } from '../../../context/InstancesStore.js';
import { Definition } from '../../../definitions/abstract/Definition.js';
import { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import { IInterceptor } from '../interceptor.js';
import { isPromise } from '../../../utils/IsPromise.js';

const notInitialized = Symbol('notInitialized');

// TODO: onEnter shouldn return new instance if the node is already registered in the graph root
// TODO: root should implement two maps - singleton nodes and scoped nodes
// TODO: onScope should return Interceptor that inherits singletons but has clean scoped definitions
// TODO: maybe nodes should be just temporal objects? maybe on every onEnter in root all the nodes should be removed from the registered entries?
export abstract class BaseInterceptor<T> implements IInterceptor<T> {
  private _value: Awaited<T> | symbol = notInitialized;

  constructor(
    protected _parent?: BaseInterceptor<unknown>,
    protected _definition?: Definition<T, LifeTime, any[]>,
    protected _children: BaseInterceptor<unknown>[] = [],
  ) {}

  get children(): this[] {
    return this._children as this[];
  }

  get value(): Awaited<T> {
    if (this._value === notInitialized) {
      throw new Error(`Value not initialized`);
    }

    return this._value as Awaited<T>;
  }

  get root(): this {
    if (this._parent) {
      return this._parent.root as this;
    }

    return this as this;
  }

  abstract create<TNewInstance>(
    parent?: BaseInterceptor<T>,
    definition?: Definition<TNewInstance, LifeTime, any[]>,
  ): BaseInterceptor<TNewInstance>;

  onDependencyCreated<TDependency>(
    instance: TDependency,
    dependencyDefinition: Definition<TDependency, any, any>,
    bindingsRegistry: IBindingRegistryRead,
    instancesStore: IInstancesStoryRead,
  ): void {}

  onSelfCreated(
    instance: Awaited<T>,
    definition: Definition<T, LifeTime, any[]>,
    bindingsRegistry: IBindingRegistryRead,
    instancesStore: IInstancesStoryRead,
  ): void {}

  onEnter<TNewInstance>(
    definition: Definition<TNewInstance, LifeTime, any[]>,
    args: any[],
    bindingsRegistry: IBindingRegistryRead,
    instancesStore: IInstancesStoryRead,
  ): IInterceptor<TNewInstance> {
    const childInterceptor = this.create<TNewInstance>(this, definition);

    this.registerByDefinition(definition, childInterceptor);
    this._children.push(childInterceptor);
    return childInterceptor;
  }

  protected registerByDefinition(definition: Definition<any, any, any[]>, graphNode: BaseInterceptor<any>) {
    if (this._parent) {
      this._parent.registerByDefinition(definition, graphNode);
    } else {
      throw new Error(`No parent to associate the dependency with`);
    }
  }

  onLeave(
    instance: T,
    definition: Definition<T, LifeTime, any[]>,
    bindingsRegistry: IBindingRegistryRead,
    instancesStore: IInstancesStoryRead,
  ): T {
    if (isPromise(instance)) {
      instance.then(instanceAwaited => {
        this.onSelfCreated(instanceAwaited as Awaited<T>, definition, bindingsRegistry, instancesStore);
        this._value = instanceAwaited as Awaited<T>;
        return this._parent?.onDependencyCreated(instanceAwaited, definition, bindingsRegistry, instancesStore);
      });
    } else {
      this.onSelfCreated(instance as Awaited<T>, definition, bindingsRegistry, instancesStore);
      this._value = instance as Awaited<T>;
      this._parent?.onDependencyCreated(instance, definition, bindingsRegistry, instancesStore);
    }

    return instance;
  }

  onScope(): IInterceptor<T> {
    return this.create(this, this._definition);
  }
}

export abstract class BaseRootInterceptor<T> extends BaseInterceptor<T> {
  constructor() {
    super(undefined, undefined);
  }

  protected abstract registerByDefinition(definition: Definition<any, any, any[]>, graphNode: BaseInterceptor<T>): void;
}
