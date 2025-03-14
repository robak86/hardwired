export interface IIdentifiable {
  readonly id: string;
}

export class ScopesRegistry {
  static create() {
    return new ScopesRegistry();
  }

  private disposables: Record<string, Disposable[]> = {};

  private _scopesFinalizer = new FinalizationRegistry<string>(this.onFinalize.bind(this));

  onFinalize(containerId: string) {
    const toBeDisposed = this.disposables[containerId] ?? [];

    console.log('Finalizing container', containerId, toBeDisposed.length, this.disposables);

    console.log('Disposing', toBeDisposed);

    toBeDisposed.forEach(disposable => disposable[Symbol.dispose]());

    delete this.disposables[containerId];
  }

  register(container: IIdentifiable, disposables: Disposable[]) {
    const containerId = container.id;

    if (this.disposables[containerId]) {
      throw new Error(`Container with id ${containerId} is already registered`);
    }

    this.disposables[containerId] = disposables;

    this._scopesFinalizer.register(container, containerId, disposables);
  }
}

export const scopes = new ScopesRegistry();
