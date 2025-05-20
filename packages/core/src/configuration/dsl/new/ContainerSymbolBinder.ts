import type { DefinitionSymbol, IDefinitionSymbol } from '../../../definitions/def-symbol.js';
import { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import type { ClassType } from '../../../definitions/utils/class-type.js';
import type { ValidDependenciesLifeTime } from '../../../definitions/abstract/InstanceDefinitionDependency.js';
import type { MaybePromise } from '../../../utils/async.js';
import { ClassDefinition } from '../../../definitions/impl/ClassDefinition.js';
import { FnDefinition } from '../../../definitions/impl/FnDefinition.js';
import type { BindingsRegistry } from '../../../context/BindingsRegistry.js';
import type { IContainer } from '../../../container/IContainer.js';
import { Definition } from '../../../definitions/impl/Definition.js';

export type ConstructorArgsSymbols<T extends any[], TCurrentLifeTime extends LifeTime> = {
  [K in keyof T]: IDefinitionSymbol<T[K], ValidDependenciesLifeTime<TCurrentLifeTime>>;
};

export class ContainerSymbolBinder<TInstance, TLifeTime extends LifeTime> {
  private readonly _allowedLifeTimes = [LifeTime.scoped, LifeTime.transient, LifeTime.singleton, LifeTime.cascading];

  constructor(
    private readonly _defSymbol: DefinitionSymbol<TInstance, TLifeTime>,
    private _bindingsRegistry: BindingsRegistry,
    private _container: IContainer,
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

    this._bindingsRegistry.register(this._defSymbol, definition, this._container);
  }

  fn<TArgs extends any[]>(
    fn: (...args: TArgs) => MaybePromise<TInstance>,
    ...dependencies: ConstructorArgsSymbols<TArgs, TLifeTime>
  ) {
    const fnDefinition = new FnDefinition(this._defSymbol.id, this._defSymbol.strategy, fn, dependencies);

    this._bindingsRegistry.register(this._defSymbol, fnDefinition, this._container);
  }

  locator(fn: (container: IContainer) => MaybePromise<TInstance>) {
    const definition = new Definition(this._defSymbol.id, this._defSymbol.strategy, fn);

    this._bindingsRegistry.register(this._defSymbol, definition, this._container);
  }

  static<TInstance>(symbol: DefinitionSymbol<TInstance, TLifeTime>, staticValue: TInstance) {
    const definition = new Definition(symbol.id, symbol.strategy, () => staticValue);

    this._bindingsRegistry.register(symbol, definition, this._container);
  }
}
