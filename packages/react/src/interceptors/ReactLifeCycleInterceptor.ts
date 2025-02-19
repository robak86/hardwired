import { ContainerConfigureFn, Definition, GraphBuilderInterceptor, ScopeTag } from 'hardwired';
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
  return useContainer().getInterceptor(reactLifeCycleInterceptor) as ReactLifeCycleRootInterceptor;
};

// TODO: use(myDefinition, {forceMount: true, forceRemount: true}) // forceMount = mount, forceRemount = unmount + mount
export class ReactLifeCycleNode<T> {
  id = Math.random();
  protected _refCount = 0;

  constructor(
    readonly value: T,
    readonly children: ReactLifeCycleNode<any>[] = [],
  ) {}

  get refCount() {
    return this._refCount;
  }

  get isMountable() {
    return this.value instanceof Object && 'onMount' in this.value;
  }

  get isUnmountable() {
    return this.value instanceof Object && 'onUnmount' in this.value;
  }

  mount(force = false) {
    if (!this.isMountable) {
      return;
    }

    if (this._refCount === 0 || force) {
      (this.value as IReactLifeCycleAware).onMount?.();
    }

    this._refCount += 1;

    // even if the current object is not mountable, we still need to mount its children
    this.children.forEach(child => child.mount(force));
  }

  unmount(force = false) {
    if (!this.isUnmountable) {
      return;
    }

    this._refCount -= 1;

    if (this._refCount === 0 || force) {
      (this.value as IReactLifeCycleAware).onUnmount?.();
    }

    // even if the current object is not unmountable, we still need to unmount its children
    this.children.forEach(child => child.unmount(force));
  }
}

export class ReactLifeCycleRootInterceptor extends GraphBuilderInterceptor<never, ReactLifeCycleNode<unknown>> {
  constructor() {
    super({
      createNode<T>(
        definition: Definition<T, any, any>,
        value: Awaited<T>,
        children: ReactLifeCycleNode<unknown>[],
        tags: ScopeTag[],
      ): ReactLifeCycleNode<T> {
        return new ReactLifeCycleNode(value, children) as ReactLifeCycleNode<T>;
      },
    });
  }

  getGraphNode<TInstance>(definition: Definition<TInstance, any, any>): ReactLifeCycleNode<TInstance> {
    const graphNode = super.getGraphNode(definition);
    if (!graphNode) {
      throw new Error(`No graph node found for ${definition.name}`);
    }

    return graphNode as ReactLifeCycleNode<TInstance>;
  }
}
