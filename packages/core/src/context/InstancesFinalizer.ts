import type { IIdentifiable } from '../container/IContainer.js';

export class InstancesFinalizer {
  static create() {
    return new InstancesFinalizer();
  }

  private _scopesDisposables = new Map<string, Disposable[]>();
  private _scopesFinalizer = new FinalizationRegistry<string>(this.onScopeFinalize.bind(this));

  constructor(
    private _rootDisposables: Disposable[] = [],
    private _rootFinalizer = new FinalizationRegistry(this.onRootFinalize.bind(this)),
  ) {}

  scope(): InstancesFinalizer {
    return new InstancesFinalizer(this._rootDisposables, this._rootFinalizer);
  }

  appendScopeDisposable(instancesRegistryId: string, disposable: Disposable) {
    if (!this._scopesDisposables.has(instancesRegistryId)) {
      this._scopesDisposables.set(instancesRegistryId, []);
    }

    console.log('Appending scope disposable');
    this._scopesDisposables.get(instancesRegistryId)!.push(disposable);
  }

  appendRootDisposable(disposable: Disposable) {
    console.log('Appending root disposable');
    this._rootDisposables.push(disposable);
  }

  registerScope(instancesRegistry: IIdentifiable) {
    console.log('registerScope', instancesRegistry.id);

    this._scopesFinalizer.register(instancesRegistry, instancesRegistry.id.toString(), []);
  }

  registerRoot(instancesRegistry: IIdentifiable) {
    // const containerId = instancesRegistry.id;

    console.log('registerRoot', instancesRegistry.id);

    this._rootFinalizer.register(instancesRegistry, '__unused', []);
  }

  private onScopeFinalize(instanceRegistryId: string) {
    console.log('InstancesFinalizer onScopeFinalize', instanceRegistryId);

    const toBeDisposed = this._scopesDisposables.get(instanceRegistryId);

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

    this._scopesDisposables.delete(instanceRegistryId);
  }

  private onRootFinalize() {
    console.log('InstancesFinalizer onRootFinalize');

    this._rootDisposables.forEach(disposable => {
      try {
        disposable[Symbol.dispose]();
      } catch (e) {
        console.error('Failed to dispose', e);
      }
    });

    this._rootDisposables.length = 0;
  }
}

export const scopes = new InstancesFinalizer();
