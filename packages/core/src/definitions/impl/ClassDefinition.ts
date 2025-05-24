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
    return use.all(...this._dependencyTokens).then(depsAwaited => {
      const instance = new this._class(...(depsAwaited as TConstructorArgs));

      return MaybeAsync.resolve(instance).then(instanceAwaited => {
        return interceptor.onInstance(instanceAwaited, depsAwaited, this.token, this._dependencyTokens);
      });
    });
  }
}
