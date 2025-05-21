import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IDefinitionSymbol } from '../../definitions/def-symbol.js';
import type { ConstructorArgsSymbols } from '../dsl/new/shared/AddDefinitionBuilder.js';
import type { ClassType } from '../../definitions/utils/class-type.js';
import type { MaybePromise } from '../../utils/async.js';
import type { IServiceLocator } from '../../container/IContainer.js';

export interface IAddDefinitionBuilder<TInstance, TAllowedLifeTime extends LifeTime> {
  class<TConstructorArgs extends any[]>(
    klass: ClassType<TInstance, TConstructorArgs>,
    ...dependencies: ConstructorArgsSymbols<TConstructorArgs, TAllowedLifeTime>
  ): void;

  fn<TArgs extends any[]>(
    fn: (...args: TArgs) => MaybePromise<TInstance>,
    ...dependencies: ConstructorArgsSymbols<TArgs, TAllowedLifeTime>
  ): void;

  static(value: TInstance): void;

  locator(fn: (container: IServiceLocator) => MaybePromise<TInstance>): void;
}

export interface IRegisterAware<TAllowedLifeTime extends LifeTime> {
  add<TInstance, TLifeTime extends TAllowedLifeTime>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): IAddDefinitionBuilder<TInstance, TLifeTime>;
}
