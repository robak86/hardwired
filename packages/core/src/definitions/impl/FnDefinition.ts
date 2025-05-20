import type { IContainer, IStrategyAware } from '../../container/IContainer.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import type { IDefinition } from '../abstract/IDefinition.js';
import type { ConstructorArgsSymbols } from '../../configuration/dsl/new/ContainerSymbolBinder.js';
import type { MaybePromise } from '../../utils/async.js';
import { isThenable } from '../../utils/IsThenable.js';

import { Definition } from './Definition.js';

export class FnDefinition<TInstance, TLifeTime extends LifeTime, TDeps extends any[]>
  implements IDefinition<TInstance, TLifeTime>
{
  readonly $type!: TInstance;

  private _hasOnlySyncDependencies = false; // flag for optimization, so we don't have to check every time

  constructor(
    public readonly id: symbol,
    public readonly strategy: TLifeTime,
    public readonly createFn: (...deps: TDeps) => TInstance,
    public readonly _dependencies?: ConstructorArgsSymbols<TDeps, TLifeTime>,
  ) {}

  override(createFn: (context: IContainer) => TInstance): IDefinition<TInstance, TLifeTime> {
    return new Definition(this.id, this.strategy, createFn);
  }

  /**
   * Binds the definition to the container. Whenever the definition is instantiated,
   * the container will be used to resolve its dependencies.
   * @param container
   */
  bindToContainer(container: IContainer & IStrategyAware): IDefinition<TInstance, TLifeTime> {
    return this.override(_use => {
      return container.buildWithStrategy(this);
    });
  }

  create(context: IContainer): MaybePromise<TInstance> {
    // no dependencies
    if (this._dependencies === undefined) {
      // @ts-ignore
      return this.createFn();
    }

    const deps = context.all(...this._dependencies);

    if (this._hasOnlySyncDependencies) {
      return this.createFn(...(deps as TDeps));
    }

    if (isThenable(deps)) {
      return deps.then(deps => {
        return this.createFn(...deps);
      }) as TInstance;
    } else {
      this._hasOnlySyncDependencies = true;

      return this.createFn(...deps);
    }
  }
}
