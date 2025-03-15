import type { IContainer } from './IContainer.js';

export class ChildScopes {
  readonly children: Record<string, WeakRef<IContainer>> = {};

  private _finalizer = new FinalizationRegistry((containerId: string) => {
    delete this.children[containerId];
  });

  get count() {
    let activeCount = 0;

    for (const childRef of Object.values(this.children)) {
      if (childRef.deref()) {
        activeCount++;
      }
    }

    return activeCount;
  }

  forEach(iterFn: (container: IContainer) => void) {
    for (const childRef of Object.values(this.children)) {
      const container = childRef.deref();

      if (container) {
        iterFn(container);
      }
    }
  }

  append(container: IContainer): void {
    if (this.children[container.id]) {
      return;
    }

    this.children[container.id] = new WeakRef(container);

    this._finalizer.register(container, container.id, container);
  }
}
