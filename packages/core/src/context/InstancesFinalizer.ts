import type { IIdentifiable } from '../container/IContainer.js';

export class InstancesFinalizer {
  static create() {
    return new InstancesFinalizer();
  }

  private _scopesDisposables: Record<string, Disposable[]> = {};
  private _scopesFinalizer = new FinalizationRegistry<string>(this.onScopeFinalize.bind(this));

  private _rootDisposables: Record<string, Disposable[]> = {};
  private _rootFinalizer = new FinalizationRegistry(this.onRootFinalize.bind(this));

  registerScope(instancesRegistry: IIdentifiable, scopeDisposables: Disposable[]) {
    console.log('registerScope', instancesRegistry.id);

    const instancesRegistryId = instancesRegistry.id;

    if (this._scopesDisposables[instancesRegistryId] !== undefined) {
      throw new Error(`Container with id ${instancesRegistryId} is already registered`);
    }

    this._scopesDisposables[instancesRegistryId] = scopeDisposables;

    this._scopesFinalizer.register(instancesRegistry, instancesRegistryId, scopeDisposables);
  }

  registerRoot(instancesRegistry: IIdentifiable, rootDisposables: Disposable[]) {
    console.log('registerRoot', instancesRegistry.id);

    const instancesRegistryId = instancesRegistry.id;

    if (this._rootDisposables[instancesRegistryId] !== undefined) {
      throw new Error(`Container with id ${instancesRegistryId} is already registered`);
    }

    this._rootDisposables[instancesRegistryId] = rootDisposables;

    this._rootFinalizer.register(instancesRegistry, instancesRegistryId, rootDisposables);
  }

  private onScopeFinalize(instanceRegistryId: string) {
    console.log('InstancesFinalizer onScopeFinalize', instanceRegistryId);

    const toBeDisposed = this._scopesDisposables[instanceRegistryId];

    if (!toBeDisposed) {
      console.log('No disposables found for container', instanceRegistryId);

      return;
    }

    toBeDisposed.forEach(disposable => {
      try {
        disposable[Symbol.dispose]();
      } catch (e) {
        console.error('Failed to dispose', e);
      }
    });

    delete this._scopesDisposables[instanceRegistryId];
  }

  private onRootFinalize(id: string) {
    console.log('InstancesFinalizer onRootFinalize');

    if (this._rootDisposables[id] === undefined) {
      return;
    }

    this._rootDisposables[id].forEach(disposable => {
      try {
        disposable[Symbol.dispose]();
      } catch (e) {
        console.error('Failed to dispose', e);
      }
    });

    delete this._rootDisposables[id];
  }
}

export const scopes = new InstancesFinalizer();
