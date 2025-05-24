import type { IDefinitionToken } from '../../../../definitions/def-symbol.js';
import { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { ClassType } from '../../../../definitions/utils/class-type.js';
import type { ValidDependenciesLifeTime } from '../../../../definitions/abstract/InstanceDefinitionDependency.js';
import { ClassDefinition } from '../../../../definitions/impl/ClassDefinition.js';
import { FnDefinition } from '../../../../definitions/impl/FnDefinition.js';
import { Definition } from '../../../../definitions/impl/Definition.js';
import type { IServiceLocator } from '../../../../container/IContainer.js';
import type { IAddDefinitionBuilder } from '../../../abstract/IRegisterAware.js';
import type { FinalizerOrVoid } from '../../../abstract/IDisposeFinalizer.js';
import { MaybeAsync } from '../../../../utils/MaybeAsync.js';

import type { ConfigurationType, IConfigurationContext } from './abstract/IConfigurationContext.js';
import { DisposeFinalizeBuilder } from './DisposeFinalizeBuilder.js';

export type ConstructorArgsSymbols<T extends any[], TCurrentLifeTime extends LifeTime> = {
  [K in keyof T]: IDefinitionToken<T[K], ValidDependenciesLifeTime<TCurrentLifeTime>>;
};

export class AddDefinitionBuilder<TInstance, TLifeTime extends LifeTime>
  implements IAddDefinitionBuilder<TInstance, TLifeTime>
{
  constructor(
    protected readonly _configType: ConfigurationType,
    protected readonly _symbol: IDefinitionToken<TInstance, TLifeTime>,
    protected readonly _allowedLifeTimes: LifeTime[],
    protected readonly _configurationContext: IConfigurationContext,
  ) {
    this.assertValidLifeTime();
  }

  private assertValidLifeTime() {
    if (!this._allowedLifeTimes.includes(this._symbol.strategy)) {
      const allowed = this._allowedLifeTimes.join(', ');

      throw new Error(
        `Invalid life time "${this._symbol.strategy}" for ${this._symbol.toString()}. Allowed: ${allowed}`,
      );
    }
  }

  class<TConstructorArgs extends any[]>(
    klass: ClassType<TInstance, TConstructorArgs>,
    ...dependencies: ConstructorArgsSymbols<TConstructorArgs, TLifeTime>
  ): FinalizerOrVoid<TInstance, TLifeTime> {
    const definition = new ClassDefinition(this._symbol, klass, dependencies);

    this._configurationContext.onDefinition(this._configType, definition);

    return this.buildFinalizer();
  }

  fn<TArgs extends any[]>(
    fn: (...args: TArgs) => TInstance,
    ...dependencies: ConstructorArgsSymbols<TArgs, TLifeTime>
  ): FinalizerOrVoid<TInstance, TLifeTime> {
    const fnDefinition = new FnDefinition(this._symbol, fn, dependencies);

    this._configurationContext.onDefinition(this._configType, fnDefinition);

    return this.buildFinalizer();
  }

  asyncFn<TArgs extends any[]>(
    fn: (...args: TArgs) => Promise<TInstance>,
    ...dependencies: ConstructorArgsSymbols<TArgs, TLifeTime>
  ): FinalizerOrVoid<TInstance, TLifeTime> {
    const fnDefinition = new FnDefinition(this._symbol, fn, dependencies);

    this._configurationContext.onDefinition(this._configType, fnDefinition);

    return this.buildFinalizer();
  }

  static(value: TInstance): FinalizerOrVoid<TInstance, TLifeTime> {
    const definition = new Definition(this._symbol, () => MaybeAsync.resolve(value));

    this._configurationContext.onDefinition(this._configType, definition);

    return this.buildFinalizer();
  }

  locator(fn: (container: IServiceLocator) => TInstance): FinalizerOrVoid<TInstance, TLifeTime> {
    const definition = new Definition(this._symbol, container => {
      return MaybeAsync.resolve(fn(container));
    });

    this._configurationContext.onDefinition(this._configType, definition);

    return this.buildFinalizer();
  }

  asyncLocator(fn: (container: IServiceLocator) => Promise<TInstance>): FinalizerOrVoid<TInstance, TLifeTime> {
    const definition = new Definition(this._symbol, container => {
      return MaybeAsync.resolve(fn(container));
    });

    this._configurationContext.onDefinition(this._configType, definition);

    return this.buildFinalizer();
  }

  // TODO: can be memoized
  private buildFinalizer(): FinalizerOrVoid<TInstance, TLifeTime> {
    if (
      this._symbol.strategy === LifeTime.singleton ||
      this._symbol.strategy === LifeTime.cascading ||
      this._symbol.strategy === LifeTime.scoped
    ) {
      return new DisposeFinalizeBuilder(this._symbol, this._configurationContext) as unknown as FinalizerOrVoid<
        TInstance,
        TLifeTime
      >;
    }

    return undefined as unknown as FinalizerOrVoid<TInstance, TLifeTime>;
  }
}
