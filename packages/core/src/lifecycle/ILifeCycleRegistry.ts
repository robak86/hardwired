import type { IContainer } from '../container/IContainer.js';
import type { MaybePromise } from '../utils/async.js';
import { maybePromiseAll } from '../utils/async.js';

export interface ILifeCycleRegistry {
  dispose(container: IContainer): MaybePromise<void>;
}

export class DisposeFunctions implements ILifeCycleRegistry {
  private _disposeFunctions: Array<(container: IContainer) => MaybePromise<void>> = [];

  append(fn: (container: IContainer) => MaybePromise<void>) {
    this._disposeFunctions.push(fn);
  }

  dispose(container: IContainer): MaybePromise<void> {
    const disposed = this._disposeFunctions.map(fn => {
      try {
        return fn(container);
      } catch (err) {
        console.error((err as any).message);
      }
    });

    return maybePromiseAll(disposed) as unknown as MaybePromise<void>;
  }
}

export class ContainerLifeCycleRegistry implements ILifeCycleRegistry {
  protected _lifeCycles: Array<ILifeCycleRegistry> = [];

  append(config: ILifeCycleRegistry) {
    this._lifeCycles.push(config);
  }

  dispose(container: IContainer): MaybePromise<void> {
    const disposed = this._lifeCycles.map(registry => {
      try {
        return registry.dispose(container);
      } catch (err) {
        console.error((err as any).message);
      }
    });

    return maybePromiseAll(disposed) as unknown as MaybePromise<void>;
  }
}
