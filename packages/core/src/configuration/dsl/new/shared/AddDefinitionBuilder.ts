import type { IDefinitionSymbol } from '../../../../definitions/def-symbol.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { ClassType } from '../../../../definitions/utils/class-type.js';
import type { ValidDependenciesLifeTime } from '../../../../definitions/abstract/InstanceDefinitionDependency.js';
import type { MaybePromise } from '../../../../utils/async.js';
import { ClassDefinition } from '../../../../definitions/impl/ClassDefinition.js';
import { FnDefinition } from '../../../../definitions/impl/FnDefinition.js';
import { Definition } from '../../../../definitions/impl/Definition.js';
import type { IServiceLocator } from '../../../../container/IContainer.js';
import type { IAddDefinitionBuilder } from '../../../abstract/IRegisterAware.js';

import type { ConfigurationType, IConfigurationContext } from './abstract/IConfigurationContext.js';

export type ConstructorArgsSymbols<T extends any[], TCurrentLifeTime extends LifeTime> = {
  [K in keyof T]: IDefinitionSymbol<T[K], ValidDependenciesLifeTime<TCurrentLifeTime>>;
};

export class AddDefinitionBuilder<TInstance, TLifeTime extends LifeTime>
  implements IAddDefinitionBuilder<TInstance, TLifeTime>
{
  constructor(
    protected readonly _configType: ConfigurationType,
    protected readonly _symbol: IDefinitionSymbol<TInstance, TLifeTime>,
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
  ) {
    const definition = new ClassDefinition(this._symbol.id, this._symbol.strategy, klass, dependencies);

    this._configurationContext.onDefinition(this._configType, definition);
  }

  fn<TArgs extends any[]>(
    fn: (...args: TArgs) => MaybePromise<TInstance>,
    ...dependencies: ConstructorArgsSymbols<TArgs, TLifeTime>
  ) {
    const fnDefinition = new FnDefinition(this._symbol.id, this._symbol.strategy, fn, dependencies);

    this._configurationContext.onDefinition(this._configType, fnDefinition);
  }

  static(value: TInstance) {
    const definition = new Definition(this._symbol.id, this._symbol.strategy, () => value);

    this._configurationContext.onDefinition(this._configType, definition);
  }

  locator(fn: (container: IServiceLocator) => MaybePromise<TInstance>) {
    const definition = new Definition(this._symbol.id, this._symbol.strategy, fn);

    this._configurationContext.onDefinition(this._configType, definition);
  }
}
