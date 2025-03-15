import EventEmitter from 'node:events';

export class InstancesFinalizer extends EventEmitter<{
  onDisposeError: [unknown];
}> {
  static create() {
    return new InstancesFinalizer();
  }

  private _finalizer = new FinalizationRegistry<Disposable[]>(this.onFinalize.bind(this));
  private _disposables = new WeakSet<Disposable>();
  private _instanceDisposables = new WeakMap<WeakKey, Disposable[]>();

  registerDisposable(instancesRegistry: WeakKey, disposable: Disposable) {
    if (this._disposables.has(disposable)) {
      return;
    }

    if (!this._instanceDisposables.has(instancesRegistry)) {
      const disposables: Disposable[] = [];

      this._instanceDisposables.set(instancesRegistry, disposables);
      this._finalizer.register(instancesRegistry, disposables, instancesRegistry);
    }

    this._instanceDisposables.get(instancesRegistry)?.push(disposable);
    this._disposables.add(disposable);
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
