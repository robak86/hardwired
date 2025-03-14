import type { IIdentifiable } from '../container/IContainer.js';

export class InstancesFinalizer {
  static create() {
    return new InstancesFinalizer();
  }

  private _scopesFinalizer = new FinalizationRegistry<Disposable[]>(this.onScopeFinalize.bind(this));
  private _rootFinalizer = new FinalizationRegistry<Disposable[]>(this.onRootFinalize.bind(this));

  private _scopeRegistries = new WeakSet<IIdentifiable>();
  private _rootRegistries = new WeakSet<IIdentifiable>();

  registerScope(instancesRegistry: IIdentifiable, scopeDisposables: Disposable[]) {
    if (this._scopeRegistries.has(instancesRegistry)) {
      return;
    }

    this._scopesFinalizer.register(instancesRegistry, scopeDisposables, scopeDisposables);
    this._scopeRegistries.add(instancesRegistry);
  }

  registerRoot(instancesRegistry: IIdentifiable, rootDisposables: Disposable[]) {
    if (this._rootRegistries.has(instancesRegistry)) {
      return;
    }

    this._rootFinalizer.register(instancesRegistry, rootDisposables, rootDisposables);
    this._rootRegistries.add(instancesRegistry);
  }

  private onScopeFinalize(disposables: Disposable[]) {
    disposables.forEach(disposable => {
      try {
        disposable[Symbol.dispose]();
      } catch (e) {
        console.error('Failed to dispose', e);
      }
    });
  }

  private onRootFinalize(disposables: Disposable[]) {
    disposables.forEach(disposable => {
      try {
        disposable[Symbol.dispose]();
      } catch (e) {
        console.error('Failed to dispose', e);
      }
    });
  }
}

export const scopes = new InstancesFinalizer();
