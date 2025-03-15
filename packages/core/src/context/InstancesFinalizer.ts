import EventEmitter from 'node:events';

import type { IIdentifiable } from '../container/IContainer.js';

export class InstancesFinalizer extends EventEmitter<{
  onDisposeError: [unknown];
}> {
  static create() {
    return new InstancesFinalizer();
  }

  private _scopesFinalizer = new FinalizationRegistry<Disposable[]>(this.onFinalize.bind(this));
  private _rootFinalizer = new FinalizationRegistry<Disposable[]>(this.onFinalize.bind(this));

  private _disposables = new WeakSet<Disposable>();

  private _scopeDisposables: Record<string, Disposable[]> = {};
  private _rootDisposables: Record<string, Disposable[]> = {};

  registerScope(instancesRegistry: IIdentifiable, scopeDisposable: Disposable) {
    if (this._disposables.has(scopeDisposable)) {
      return;
    }

    if (this._scopeDisposables[instancesRegistry.id] === undefined) {
      const disposables: Disposable[] = [];

      this._scopeDisposables[instancesRegistry.id] = disposables;
      this._scopesFinalizer.register(instancesRegistry, disposables, instancesRegistry);
    }

    this._scopeDisposables[instancesRegistry.id].push(scopeDisposable);
    this._disposables.add(scopeDisposable);
  }

  registerRoot(instancesRegistry: IIdentifiable, rootDisposable: Disposable) {
    if (this._disposables.has(rootDisposable)) {
      return;
    }

    if (this._rootDisposables[instancesRegistry.id] === undefined) {
      const disposables: Disposable[] = [];

      this._rootDisposables[instancesRegistry.id] = disposables;
      this._rootFinalizer.register(instancesRegistry, disposables, instancesRegistry);
    }

    this._rootDisposables[instancesRegistry.id].push(rootDisposable);
    this._disposables.add(rootDisposable);
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
