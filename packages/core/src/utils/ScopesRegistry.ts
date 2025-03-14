export interface IIdentifiable {
  readonly id: string;
}

export class ScopesRegistry {
  static create() {
    return new ScopesRegistry();
  }

  private _scopesDisposables: Record<string, Disposable[]> = {};
  private _rootDisposables: Record<string, Disposable[]> = {}; // should be actually a one!

  private _scopesFinalizer = new FinalizationRegistry<string>(this.onScopeFinalize.bind(this));
  private _rootFinalizer = new FinalizationRegistry<string>(this.onRootFinalize.bind(this));

  // private _childScopes = new Map<string, string[]>(); // by parent Id

  private onScopeFinalize(containerId: string) {
    console.log('onScopeFinalize', containerId);

    const toBeDisposed = this._scopesDisposables[containerId];

    if (!toBeDisposed) {
      console.log('No disposables found for container', containerId);

      return;
    }

    toBeDisposed.forEach(disposable => {
      try {
        disposable[Symbol.dispose]();
      } catch (e) {
        console.error('Failed to dispose', e);
      }
    });

    delete this._scopesDisposables[containerId];
  }

  // dispose(containerId: string) {
  //   throw new Error('Implement me!');
  // }

  private onRootFinalize(containerId: string) {
    console.log('onRootFinalize', containerId);
    const toBeDisposed = this._rootDisposables[containerId];

    if (!toBeDisposed) {
      console.log('No disposables found for container', containerId);

      return;
    }

    toBeDisposed.forEach(disposable => {
      try {
        disposable[Symbol.dispose]();
      } catch (e) {
        console.error('Failed to dispose', e);
      }
    });

    delete this._rootDisposables[containerId];
  }

  registerScope(container: IIdentifiable, disposables: Disposable[]) {
    const containerId = container.id;

    if (this._scopesDisposables[containerId]) {
      throw new Error(`Container with id ${containerId} is already registered`);
    }

    this._scopesDisposables[containerId] = disposables;

    this._scopesFinalizer.register(container, containerId, disposables);
  }

  registerRoot(container: IIdentifiable, disposables: Disposable[]) {
    const containerId = container.id;

    if (this._rootDisposables[containerId]) {
      throw new Error(`Container with id ${containerId} is already registered`);
    }

    this._rootDisposables[containerId] = disposables;

    this._rootFinalizer.register(container, containerId, disposables);
  }
}

export const scopes = new ScopesRegistry();
