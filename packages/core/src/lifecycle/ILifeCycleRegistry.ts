import type { IContainer } from '../container/IContainer.js';
import type { MaybePromise } from '../utils/async.js';
import type { IDefinitionToken } from '../definitions/def-symbol.js';
import type { LifeTime } from '../definitions/abstract/LifeTime.js';
import { MaybeAsync } from '../utils/MaybeAsync.js';

export interface ILifeCycleRegistry {
  dispose(container: IContainer): MaybeAsync<void>;
}

export class DisposeFunctions implements ILifeCycleRegistry {
  private _disposeFunctions: Array<(container: IContainer) => MaybePromise<void>> = [];

  append(fn: (container: IContainer) => MaybePromise<void>) {
    this._disposeFunctions.push(fn);
  }

  dispose(container: IContainer): MaybeAsync<void> {
    const disposed = this._disposeFunctions.map(fn => {
      try {
        return fn(container);
      } catch (err) {
        console.error((err as any).message);
      }
    });

    return MaybeAsync.all(disposed) as unknown as MaybeAsync<void>;
  }
}

export class DefinitionsDisposeFunctions implements ILifeCycleRegistry {
  private _disposeFunctions = new Map<
    IDefinitionToken<unknown, LifeTime>,
    Array<(instance: unknown) => MaybePromise<void>>
  >();

  append<TInstance>(token: IDefinitionToken<TInstance, LifeTime>, fn: (instance: TInstance) => MaybePromise<void>) {
    if (!this._disposeFunctions.has(token)) {
      this._disposeFunctions.set(token, []);
    }

    this._disposeFunctions.get(token)?.push(fn as any);
  }

  dispose(container: IContainer): MaybeAsync<void> {
    const disposeTasks = Array.from(this._disposeFunctions).map(([token, disposeFns]) => {
      const instance = container.useExisting(token);

      return instance.then(awaited => {
        if (!awaited) {
          return MaybeAsync.resolve([]);
        }

        return MaybeAsync.all(
          disposeFns.map(fn => {
            try {
              return fn(awaited);
            } catch (err) {
              console.error((err as any).message);
            }
          }),
        );
      });
    });

    return MaybeAsync.all(disposeTasks) as unknown as MaybeAsync<void>;
  }
}

export class ContainerLifeCycleRegistry implements ILifeCycleRegistry {
  protected _lifeCycles: Array<ILifeCycleRegistry> = [];

  append(config: ILifeCycleRegistry) {
    this._lifeCycles.push(config);
  }

  dispose(container: IContainer): MaybeAsync<void> {
    const disposed = this._lifeCycles.map(registry => {
      try {
        return registry.dispose(container);
      } catch (err) {
        console.error((err as any).message);
      }
    });

    return MaybeAsync.all(disposed) as unknown as MaybeAsync<void>;
  }
}
