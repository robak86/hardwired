import { BaseInterceptor, ContainerConfigureFn, Definition, LifeTime } from 'hardwired';
import { useContainer } from '../context/ContainerContext.js';

export interface IReactLifeCycleAware {
  onMount?(): void;
  onUnmount?(): void;
}

export const reactLifeCycleInterceptor = Symbol('reactLifeCycleInterceptor');

export const withReactLifeCycle: ContainerConfigureFn = c => {
  c.withInterceptor(reactLifeCycleInterceptor, new ReactLifeCycleRootInterceptor());
};

export const useReactLifeCycleInterceptor = () => {
  return useContainer().getInterceptor(reactLifeCycleInterceptor) as ReactLifeCycleRootInterceptor<any>;
};

export class ReactLifeCycleInterceptor<T> extends BaseInterceptor<T> {
  id = Math.random();

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
  private _nodesByDefinitionId = new Map<symbol, ReactLifeCycleInterceptor<any>>();

  create<TNewInstance>(
    parent?: BaseInterceptor<T>,
    definition?: Definition<TNewInstance, LifeTime, any[]>,
  ): BaseInterceptor<TNewInstance> {
    return new ReactLifeCycleInterceptor(parent, definition);
  }

  getGraphNode<TInstance>(
    definition: Definition<TInstance, LifeTime.scoped | LifeTime.singleton, any[]>,
  ): ReactLifeCycleInterceptor<TInstance> {
    const graphNode = this._nodesByDefinitionId.get(definition.id);

    if (!graphNode) {
      throw new Error(`No graph node found for definition ${definition.id.toString()}`);
    }

    return graphNode as unknown as ReactLifeCycleInterceptor<TInstance>;
  }

  override registerByDefinition(definition: Definition<any, any, any[]>, graphNode: BaseInterceptor<any>) {
    if (this._nodesByDefinitionId.has(definition.id)) {
      return;
    }

    this._nodesByDefinitionId.set(definition.id, graphNode as ReactLifeCycleInterceptor<any>);
  }
}
