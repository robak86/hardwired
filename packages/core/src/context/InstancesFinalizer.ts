import EventEmitter from 'node:events';

export class InstancesFinalizer extends EventEmitter<{
  onDisposeError: [unknown];
}> {
  static create() {
    return new InstancesFinalizer();
  }

  private _scopesFinalizer = new FinalizationRegistry<Disposable[]>(this.onFinalize.bind(this));
  private _rootFinalizer = new FinalizationRegistry<Disposable[]>(this.onFinalize.bind(this));

  private _scopeRegistries = new WeakMap<WeakKey, Disposable[]>();
  private _rootRegistries = new WeakMap<WeakKey, Disposable[]>();

  registerScope(instancesRegistry: WeakKey, scopeDisposables: Disposable[]) {
    if (this._scopeRegistries.has(instancesRegistry)) {
      return;
    }

    this._scopesFinalizer.register(instancesRegistry, scopeDisposables, instancesRegistry);
    this._scopeRegistries.set(instancesRegistry, scopeDisposables);
  }

  registerRoot(instancesRegistry: WeakKey, rootDisposables: Disposable[]) {
    if (this._rootRegistries.has(instancesRegistry)) {
      return;
    }

    this._rootFinalizer.register(instancesRegistry, rootDisposables, instancesRegistry);
    this._rootRegistries.set(instancesRegistry, rootDisposables);
  }

  private onFinalize(disposables: Disposable[]) {
    disposables.forEach(disposable => {
      try {
        disposable[Symbol.dispose]();
      } catch (e) {
        this.emit('onDisposeError', e);
      }
    });
  }
}

export const scopes = new InstancesFinalizer();
