import type { IReactLifeCycleAware } from './ReactLifeCycleInterceptor.js';

export type ReactLifeCycleNodeCallbacks = {
  onMount?: <T>(instance: T) => void;
  onUnmount?: <T>(instance: T) => void;
};

export class ReactLifeCycleNode<T> {
  protected _refCount = 0;

  constructor(
    readonly value: T,
    readonly children: ReactLifeCycleNode<any>[] = [],
    private _callbacks?: ReactLifeCycleNodeCallbacks,
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

  acquire(forceMount = false) {
    if ((this.isMountable && this._refCount === 0) || forceMount) {
      this._callbacks?.onMount?.(this.value);
      (this.value as IReactLifeCycleAware).onMount?.();
    }

    if (this.isMountable || (this.isUnmountable && !forceMount)) {
      this._refCount += 1;
    }

    // even if the current object is not mountable, we still need to mount its children
    this.children.forEach(child => child.acquire(forceMount));
  }

  release(forceUnmount = false) {
    if (this.isUnmountable || (this.isMountable && !forceUnmount)) {
      this._refCount -= 1;
    }

    if ((this.isUnmountable && this._refCount === 0) || forceUnmount) {
      this._callbacks?.onUnmount?.(this.value);
      (this.value as IReactLifeCycleAware).onUnmount?.();
    }

    // even if the current object is not unmountable, we still need to unmount its children
    this.children.forEach(child => child.release(forceUnmount));
  }
}
