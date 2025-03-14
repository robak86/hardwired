import type { BindingsRegistry } from '../context/BindingsRegistry.js';
import type { InstancesStore } from '../context/InstancesStore.js';
import type { Definition } from '../definitions/abstract/Definition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

export interface IIdentifiable {
  readonly id: string;
}

export class DefinitionDisposable<T> implements Disposable {
  constructor(
    private _definition: Definition<T, LifeTime.scoped | LifeTime.singleton, []>,
    private _dispose: (instance: Awaited<T>) => void | Promise<void>,
    private _bindings: BindingsRegistry,
    private _instances: InstancesStore,
  ) {}

  [Symbol.dispose]() {
    if (!this._instances.has(this._definition.id)) {
      return;
    }

    const instance = this._instances.get(this._definition.id) as T;

    if (this._definition.strategy === LifeTime.singleton) {
      Promise.resolve(instance)
        .then(instance => {
          return this.disposeSingleton(instance);
        })
        .catch(err => {
          console.error(`Error disposing scoped instance ${this._definition.name}`, err);
        });

      return;
    }

    if (this._definition.strategy === LifeTime.scoped) {
      Promise.resolve(instance)
        .then(instance => {
          return this.disposeScoped(instance);
        })
        .catch(err => {
          console.error(`Error disposing scoped instance ${this._definition.name}`, err);
        });

      return;
    }
  }

  private async disposeSingleton(instance: Awaited<T>) {
    await this._dispose(instance);
  }

  private async disposeScoped(instance: Awaited<T>) {
    if (this._bindings.hasCascadingDefinition(this._definition.id)) {
      return;
    }

    await this._dispose(instance);
  }
}

export class ScopesRegistry {
  static create() {
    return new ScopesRegistry();
  }

  private disposables: Record<string, Disposable[]> = {};

  private _scopesFinalizer = new FinalizationRegistry<string>(this.onFinalize.bind(this));

  onFinalize(containerId: string) {
    const toBeDisposed = this.disposables[containerId] ?? [];

    // console.log('Finalizing container', containerId, toBeDisposed.length, this.disposables);

    // console.log('Disposing', toBeDisposed);

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
