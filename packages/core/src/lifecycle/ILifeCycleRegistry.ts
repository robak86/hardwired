import type { IContainer } from '../container/IContainer.js';

export interface ILifeCycleRegistry {
  setDisposeFns(disposeFns: Array<(scope: IContainer) => void>): void;
  dispose(container: IContainer): void;
}

export class ContainerLifeCycleRegistry implements ILifeCycleRegistry {
  private _disposeFns: Array<(scope: IContainer) => void> = [];

  setDisposeFns(disposeFns: Array<(scope: IContainer) => void>): void {
    this._disposeFns = disposeFns;
  }

  dispose(container: IContainer) {
    for (const disposeFn of this._disposeFns) {
      try {
        disposeFn(container);
      } catch (error) {
        console.error((error as any).message);
      }
    }
  }
}
