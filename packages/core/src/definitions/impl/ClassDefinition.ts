import type { ClassType } from '../utils/class-type.js';
import type { IServiceLocator } from '../../container/IContainer.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import type { IDefinition } from '../abstract/IDefinition.js';
import type { ConstructorArgsSymbols } from '../../configuration/dsl/new/shared/AddDefinitionBuilder.js';
import type { IInterceptor } from '../../container/interceptors/interceptor.js';
import type { IDefinitionToken } from '../def-symbol.js';
import { MaybeAsync } from '../../utils/MaybeAsync.js';

import { Definition } from './Definition.js';

export class ClassDefinition<TInstance, TLifeTime extends LifeTime, TConstructorArgs extends unknown[]>
  implements IDefinition<TInstance, TLifeTime>
{
  private _hasOnlySyncDependencies = false; // flag for optimization, so we don't have to check every time

  constructor(
    public readonly token: IDefinitionToken<TInstance, TLifeTime>,
    protected readonly _class: ClassType<TInstance, TConstructorArgs>,
    protected readonly _dependencyTokens: ConstructorArgsSymbols<TConstructorArgs, TLifeTime>,
  ) {}

  get id() {
    return this.token.id;
  }

  get strategy() {
    return this.token.strategy;
  }

  override(
    createFn: (context: IServiceLocator, interceptor: IInterceptor) => MaybeAsync<TInstance>,
  ): IDefinition<TInstance, TLifeTime> {
    return new Definition(this.token, createFn);
  }

  toString() {
    return `${this.token.toString()}:${this._class.name}`;
  }

  create(use: IServiceLocator, interceptor: IInterceptor): MaybeAsync<TInstance> {
    // no dependencies
    if (this._dependencyTokens.length === 0) {
      // @ts-ignore - mute error about missing args
      const instance = new this._class();

      return MaybeAsync.resolve(instance).then(instance => {
        return interceptor.onInstance(instance, [], this.token, []);
      });
    }

    const result = use.all(...this._dependencyTokens).then(depsAwaited => {
      const instance = new this._class(...(depsAwaited as TConstructorArgs));

      return MaybeAsync.resolve(instance).then(instanceAwaited => {
        return interceptor.onInstance(instanceAwaited, depsAwaited, this.token, this._dependencyTokens);
      });
    });

    if (result.isSync) {
      // TODO: change flag, and resolve always as sync, (separate method);
    }

    return result;

    // if (this._hasOnlySyncDependencies) {
    //   const instance = new this._class(...(deps as TConstructorArgs));
    //
    //   return (
    //     interceptor?.onInstance?.<TInstance>(instance, deps as TConstructorArgs, this.token, this._dependencyTokens) ??
    //     instance
    //   );
    // }
    //
    // if (isThenable(deps)) {
    //   return deps.then(deps => {
    //     const instance = new this._class(...deps);
    //
    //     return interceptor?.onInstance?.<TInstance>(instance, deps, this.token, this._dependencyTokens) ?? instance;
    //   }) as TInstance;
    // } else {
    //   this._hasOnlySyncDependencies = true;
    //
    //   const instance = new this._class(...(deps as TConstructorArgs));
    //
    //   return interceptor?.onInstance?.<TInstance>(instance, deps, this.token, this._dependencyTokens) ?? instance;
    // }
  }
}
