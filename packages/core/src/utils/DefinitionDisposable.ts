import type { Definition } from '../definitions/abstract/Definition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import type { BindingsRegistry } from '../context/BindingsRegistry.js';
import type { InstancesStore } from '../context/InstancesStore.js';

export class DefinitionDisposable<T> implements Disposable {
  constructor(
    private _definition: Definition<T, LifeTime.scoped | LifeTime.singleton, []>,
    private _dispose: (instance: Awaited<T>) => void | Promise<void>,
    private _bindings: BindingsRegistry,
    private _instances: InstancesStore,
  ) {}

  [Symbol.dispose]() {
    if (!this._instances.has(this._definition.id)) {
      console.log('No instance exists for definition', this._definition.name);

      return;
    }

    const instance = this._instances.get(this._definition.id) as T;

    if (this._definition.strategy === LifeTime.singleton) {
      Promise.resolve(instance)
        .then(instance => this.disposeSingleton(instance))
        .catch(err => console.error(`Error disposing scoped instance ${this._definition.name}`, err));

      return;
    }

    if (this._definition.strategy === LifeTime.scoped) {
      console.log('Disposing scoped');

      Promise.resolve(instance)
        .then(instance => this.disposeScoped(instance))
        .catch(err => console.error(`Error disposing scoped instance ${this._definition.name}`, err));

      return;
    }
  }

  private async disposeSingleton(instance: Awaited<T>) {
    await this._dispose(instance);
  }

  private async disposeScoped(instance: Awaited<T>) {
    if (this._bindings.inheritsScopedDefinition(this._definition.id)) {
      console.log('Inherits scoped definition', this._definition.name);

      return;
    }

    console.log('Disposing scoped');

    await this._dispose(instance);
  }
}
