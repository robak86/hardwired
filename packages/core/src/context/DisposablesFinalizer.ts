import EventEmitter from 'node:events';

export class DisposablesFinalizer extends EventEmitter<{
  onDisposeError: [unknown];
}> {
  static create() {
    return new DisposablesFinalizer();
  }

  private _finalizer = new FinalizationRegistry<Disposable[]>(this.onFinalize.bind(this));
  private _disposables = new WeakSet<Disposable>(); // global registry of registered disposables. We wan't make sure that we don't register the same disposable twice.
  private _instanceDisposables = new WeakMap<WeakKey, Disposable[]>();

  /***
   * Registers disposable instance to be disposed when the target is garbage collected.
   * For the target we use object that lives as a part of a scope (InstancesStore). So whenever instances store
   * is garbage collected, all disposables that are registered for that store will be disposed.
   * @param target
   * @param disposable
   */
  registerDisposable(target: WeakKey, disposable: Disposable) {
    if (this._disposables.has(disposable)) {
      return;
    }

    if (!this._instanceDisposables.has(target)) {
      const disposables: Disposable[] = [];

      this._instanceDisposables.set(target, disposables);
      this._finalizer.register(target, disposables, target);
    }

    this._instanceDisposables.get(target)?.push(disposable);
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

export const scopes = new DisposablesFinalizer();
