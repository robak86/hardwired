import type { ClassType } from '../utils/class-type.js';
import type { IContainer } from '../../container/IContainer.js';
import { isThenable } from '../../utils/IsThenable.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import type { IDefinition } from '../abstract/IDefinition.js';
import type { ConstructorArgsSymbols } from '../../configuration/dsl/new/ContainerSymbolBinder.js';
import type { MaybePromise } from '../../utils/async.js';

import { Definition } from './Definition.js';

export class ClassDefinition<TInstance, TLifeTime extends LifeTime, TConstructorArgs extends unknown[]>
  implements IDefinition<TInstance, TLifeTime>
{
  private _hasOnlySyncDependencies = false; // flag for optimization, so we don't have to check every time

  readonly $type!: TInstance;

  constructor(
    public readonly id: symbol,
    public readonly strategy: TLifeTime,
    protected readonly _class: ClassType<TInstance, TConstructorArgs>,
    protected readonly _dependencies?: ConstructorArgsSymbols<TConstructorArgs, TLifeTime>,
  ) {}

  override(createFn: (context: IContainer) => MaybePromise<TInstance>): IDefinition<TInstance, TLifeTime> {
    return new Definition(this.id, this.strategy, createFn);
  }

  toString() {
    return `${this.id.toString()}:${this._class.name}`;
  }

  create(use: IContainer): MaybePromise<TInstance> {
    // no dependencies
    if (this._dependencies === undefined) {
      // @ts-ignore
      return new this._class();
    }

    const deps = use.all(...this._dependencies) as TConstructorArgs | Promise<TConstructorArgs>;

    if (this._hasOnlySyncDependencies) {
      return new this._class(...(deps as TConstructorArgs));
    }

    if (isThenable(deps)) {
      return deps.then(deps => {
        return new this._class(...deps);
      }) as TInstance;
    } else {
      this._hasOnlySyncDependencies = true;

      return new this._class(...deps);
    }
  }
}
