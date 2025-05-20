import type { IDefinitionSymbol } from '../../../definitions/def-symbol.js';
import { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import type { ClassType } from '../../../definitions/utils/class-type.js';
import type { ValidDependenciesLifeTime } from '../../../definitions/abstract/InstanceDefinitionDependency.js';
import type { MaybePromise } from '../../../utils/async.js';
import { ClassDefinition } from '../../../definitions/impl/ClassDefinition.js';
import { FnDefinition } from '../../../definitions/impl/FnDefinition.js';
import type { IDefinition } from '../../../definitions/abstract/IDefinition.js';

export type ConstructorArgsSymbols<T extends any[], TCurrentLifeTime extends LifeTime> = {
  [K in keyof T]: IDefinitionSymbol<T[K], ValidDependenciesLifeTime<TCurrentLifeTime>>;
};

export class ScopeSymbolBinder<TInstance, TLifeTime extends LifeTime> {
  private readonly _allowedLifeTimes = [LifeTime.scoped, LifeTime.transient, LifeTime.cascading];

  constructor(
    private readonly _defSymbol: IDefinitionSymbol<TInstance, TLifeTime>,
    private _onRegister: (symbol: IDefinition<TInstance, TLifeTime>) => void,
  ) {
    this.assertValidLifeTime();
  }

  private assertValidLifeTime() {
    if (!this._allowedLifeTimes.includes(this._defSymbol.strategy)) {
      const allowed = this._allowedLifeTimes.join(', ');

      throw new Error(
        `Invalid life time "${this._defSymbol.strategy}" for ${this._defSymbol.toString()}. Allowed: ${allowed}`,
      );
    }
  }

  class<TConstructorArgs extends any[]>(
    klass: ClassType<TInstance, TConstructorArgs>,
    ...dependencies: ConstructorArgsSymbols<TConstructorArgs, TLifeTime>
  ) {
    const definition = new ClassDefinition(this._defSymbol.id, this._defSymbol.strategy, klass, dependencies);

    this._onRegister(definition);
  }

  fn<TArgs extends any[]>(
    fn: (...args: TArgs) => MaybePromise<TInstance>,
    ...dependencies: ConstructorArgsSymbols<TArgs, TLifeTime>
  ) {
    const fnDefinition = new FnDefinition(this._defSymbol.id, this._defSymbol.strategy, fn, dependencies);

    this._onRegister(fnDefinition as IDefinition<TInstance, TLifeTime>);
  }
}
