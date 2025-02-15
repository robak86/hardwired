import { IBindingRegistryRead } from '../../../context/BindingsRegistry.js';
import { IInstancesStoryRead } from '../../../context/InstancesStore.js';
import { Definition } from '../../../definitions/abstract/Definition.js';
import { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import { IInterceptor } from '../interceptor.js';
import { isPromise } from '../../../utils/IsPromise.js';

const notInitialized = Symbol('notInitialized');

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
    const existingNode: BaseInterceptor<TNewInstance> | undefined = this.getGraphNode(definition as any); // TODO: type

    if (existingNode) {
      return existingNode;
    } else {
      const childInterceptor = this.create<TNewInstance>(this, definition);

      this.registerByDefinition(definition, childInterceptor);
      this._children.push(childInterceptor);
      return childInterceptor;
    }
  }

  getGraphNode<TInstance>(
    definition: Definition<TInstance, LifeTime.scoped | LifeTime.singleton, any[]>,
  ): BaseInterceptor<TInstance> | undefined {
    return this._parent?.getGraphNode(definition);
  }

  protected registerByDefinition<T>(definition: Definition<T, any, any[]>, graphNode: BaseInterceptor<T>) {
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
  private _singletonNodes = new Map<symbol, BaseInterceptor<any>>();
  private _scopedNodes = new Map<symbol, BaseInterceptor<any>>();

  constructor() {
    super(undefined, undefined);
  }

  registerByDefinition<T>(definition: Definition<T, any, any[]>, graphNode: BaseInterceptor<T>): void {
    if (definition.strategy === LifeTime.singleton) {
      if (this._singletonNodes.has(definition.id)) {
        throw new Error(`Node already registered`);
      } else {
        this._singletonNodes.set(definition.id, graphNode);
      }
    }

    if (definition.strategy === LifeTime.scoped) {
      if (this._scopedNodes.has(definition.id)) {
        throw new Error(`Node already registered`);
      } else {
        this._scopedNodes.set(definition.id, graphNode);
      }
    }
  }
  getGraphNode<TInstance>(
    definition: Definition<TInstance, LifeTime.scoped | LifeTime.singleton, any[]>,
  ): BaseInterceptor<TInstance> {
    switch (definition.strategy) {
      case LifeTime.singleton:
        return this._singletonNodes.get(definition.id) as BaseInterceptor<TInstance>;
      case LifeTime.scoped:
        return this._scopedNodes.get(definition.id) as BaseInterceptor<TInstance>;
    }
  }
}
