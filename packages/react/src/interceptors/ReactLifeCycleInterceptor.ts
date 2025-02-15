import { BaseInterceptor, Definition, LifeTime } from 'hardwired';

export interface IReactLifeCycleAware {
  onMount?(): void;
  onUnmount?(): void;
}

export const reactLifeCycleInterceptor = Symbol('reactLifeCycleInterceptor');

export class ReactLifeCycleInterceptor<T> extends BaseInterceptor<T> {
  protected _isMounted = false;

  create<TNewInstance>(
    parent?: BaseInterceptor<T>,
    definition?: Definition<TNewInstance, LifeTime, any[]>,
  ): BaseInterceptor<TNewInstance> {
    return new ReactLifeCycleInterceptor(parent, definition);
  }

  get isMountable() {
    return this.value instanceof Object && 'onMount' in this.value;
  }

  get isUnmountable() {
    return this.value instanceof Object && 'onUnmount' in this.value;
  }

  mount(force = false) {
    if ((this.isMountable && !this._isMounted) || force) {
      (this.value as IReactLifeCycleAware).onMount?.();
      this._isMounted = true;
    }

    // even if the current object is not mountable, we still need to mount its children
    this.children.forEach(child => child.mount(force));
  }

  unmount(force = false) {
    if ((this.isUnmountable && this._isMounted) || force) {
      (this.value as IReactLifeCycleAware).onUnmount?.();
      this._isMounted = false;
    }

    // even if the current object is not unmountable, we still need to unmount its children
    this.children.forEach(child => child.unmount(force));
  }
}

export class ReactLifeCycleRootInterceptor<T> extends ReactLifeCycleInterceptor<T> {
  private _nodesByDefinitionId: Record<symbol, ReactLifeCycleInterceptor<any>> = {};

  create<TNewInstance>(
    parent?: BaseInterceptor<T>,
    definition?: Definition<TNewInstance, LifeTime, any[]>,
  ): BaseInterceptor<TNewInstance> {
    return new ReactLifeCycleInterceptor(parent, definition);
  }

  getGraphNode<TInstance>(
    definition: Definition<TInstance, LifeTime.scoped | LifeTime.singleton, any[]>, // TODO: no idea how to handle transient in a reliable way
  ): ReactLifeCycleInterceptor<TInstance> {
    const graphNode = this._nodesByDefinitionId[definition.id];

    if (!graphNode) {
      throw new Error(`No graph node found for definition ${definition.id.toString()}`);
    }

    return graphNode as unknown as ReactLifeCycleInterceptor<TInstance>;
  }

  override registerByDefinition(definition: Definition<any, any, any[]>, graphNode: BaseInterceptor<any>) {
    this._nodesByDefinitionId[definition.id] = graphNode as ReactLifeCycleInterceptor<any>;
  }
}
