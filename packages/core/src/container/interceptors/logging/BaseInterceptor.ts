import { IBindingRegistryRead } from '../../../context/BindingsRegistry.js';
import { IInstancesStoryRead } from '../../../context/InstancesStore.js';
import { Definition } from '../../../definitions/abstract/Definition.js';
import { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import { IInterceptor } from '../interceptor.js';
import { isPromise } from '../../../utils/IsPromise.js';

export abstract class BaseInterceptor<T> implements IInterceptor<T> {
  constructor(
    protected _parent?: BaseInterceptor<unknown>,
    protected _definition?: Definition<T, LifeTime, any[]>,
    protected _children: BaseInterceptor<unknown>[] = [],
  ) {}

  get children(): this[] {
    return this._children as this[];
  }

  registerByDefinition(definition: Definition<any, any, any[]>, graphNode: BaseInterceptor<any>) {
    if (this._parent) {
      this._parent.registerByDefinition(definition, graphNode);
    } else {
      throw new Error(`No parent to associate the dependency with`);
    }
  }

  abstract create<TNewInstance>(
    parent?: BaseInterceptor<unknown>,
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

  onLeave(
    instance: T,
    definition: Definition<T, LifeTime, any[]>,
    bindingsRegistry: IBindingRegistryRead,
    instancesStore: IInstancesStoryRead,
  ): T {
    if (isPromise(instance)) {
      instance.then(instanceAwaited => {
        this.onSelfCreated(instanceAwaited as Awaited<T>, definition, bindingsRegistry, instancesStore);
        return this._parent?.onDependencyCreated(instanceAwaited, definition, bindingsRegistry, instancesStore);
      });
    } else {
      this.onSelfCreated(instance as Awaited<T>, definition, bindingsRegistry, instancesStore);
      this._parent?.onDependencyCreated(instance, definition, bindingsRegistry, instancesStore);
    }

    return instance;
  }

  onScope(): IInterceptor<T> {
    return this.create(this._parent, this._definition);
  }
}

export abstract class BaseRootInterceptor<T> extends BaseInterceptor<T> {
  protected _nodes: Record<symbol, BaseInterceptor<any>> = {};

  constructor() {
    super(undefined, undefined);
  }

  registerByDefinition(definition: Definition<any, any, any[]>, graphNode: BaseInterceptor<T>) {
    this._nodes[definition.id] = graphNode;
  }
}
