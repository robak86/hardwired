import type { ClassType } from '../utils/class-type.js';
import type { IServiceLocator } from '../../container/IContainer.js';
import { isThenable } from '../../utils/IsThenable.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import type { IDefinition } from '../abstract/IDefinition.js';
import type { MaybePromise } from '../../utils/async.js';
import type { ConstructorArgsSymbols } from '../../configuration/dsl/new/shared/AddDefinitionBuilder.js';
import type { INewInterceptor } from '../../container/interceptors/interceptor.js';

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

  override(createFn: (context: IServiceLocator) => MaybePromise<TInstance>): IDefinition<TInstance, TLifeTime> {
    return new Definition(this.id, this.strategy, createFn);
  }

  toString() {
    return `${this.id.toString()}:${this._class.name}`;
  }

  create(use: IServiceLocator, interceptor?: INewInterceptor): MaybePromise<TInstance> {
    // no dependencies
    if (this._dependencies === undefined) {
      // @ts-ignore - mute error about missing args
      const instance = new this._class();

      return interceptor?.onInstance?.(instance, []) ?? instance;
    }

    const deps = use.all(...this._dependencies) as TConstructorArgs | Promise<TConstructorArgs>;

    if (this._hasOnlySyncDependencies) {
      const instance = new this._class(...(deps as TConstructorArgs));

      return interceptor?.onInstance?.(instance, []) ?? instance;
    }

    if (isThenable(deps)) {
      return deps.then(deps => {
        const instance = new this._class(...deps);

        return interceptor?.onInstance?.(instance, []) ?? instance;
      }) as TInstance;
    } else {
      this._hasOnlySyncDependencies = true;

      const instance = new this._class(...(deps as TConstructorArgs));

      return interceptor?.onInstance?.(instance, []) ?? instance;
    }
  }
}
