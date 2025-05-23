import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IDefinitionToken } from '../../definitions/def-symbol.js';
import type { ConstructorArgsSymbols } from '../dsl/new/shared/AddDefinitionBuilder.js';
import type { ClassType } from '../../definitions/utils/class-type.js';
import type { MaybePromise } from '../../utils/async.js';
import type { IServiceLocator } from '../../container/IContainer.js';

import type { FinalizerOrVoid } from './IDisposeFinalizer.js';

export interface IAddDefinitionBuilder<TInstance, TLifetime extends LifeTime> {
  class<TConstructorArgs extends any[]>(
    klass: ClassType<TInstance, TConstructorArgs>,
    ...dependencies: ConstructorArgsSymbols<TConstructorArgs, TLifetime>
  ): FinalizerOrVoid<TInstance, TLifetime>;

  fn<TArgs extends any[]>(
    fn: (...args: TArgs) => MaybePromise<TInstance>,
    ...dependencies: ConstructorArgsSymbols<TArgs, TLifetime>
  ): FinalizerOrVoid<TInstance, TLifetime>;

  static(value: TInstance): FinalizerOrVoid<TInstance, TLifetime>;

  locator(fn: (container: IServiceLocator) => MaybePromise<TInstance>): FinalizerOrVoid<TInstance, TLifetime>;
}

export interface IRegisterAware<TAllowedLifeTime extends LifeTime> {
  add<TInstance, TLifeTime extends TAllowedLifeTime>(
    symbol: IDefinitionToken<TInstance, TLifeTime>,
  ): IAddDefinitionBuilder<TInstance, TLifeTime>;
}
