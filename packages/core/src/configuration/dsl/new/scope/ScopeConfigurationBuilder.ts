import { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { ScopeConfigurable, ScopeConfigureAllowedLifeTimes } from '../../../abstract/ScopeConfigurable.js';
import type { IContainer, IStrategyAware } from '../../../../container/IContainer.js';
import type { BindingsRegistry } from '../../../../context/BindingsRegistry.js';
import type { DefinitionSymbol, IDefinitionSymbol } from '../../../../definitions/def-symbol.js';
import type { MaybePromise } from '../../../../utils/async.js';
import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import { SymbolsRegistrationBuilder } from '../shared/SymbolsRegistrationBuilder.js';
import { OwningDefinitionBuilder } from '../shared/OwningDefinitionBuilder.js';
import { createConfiguredDefinition } from '../utils/create-configured-definition.js';
import { createDecoratedDefinition } from '../utils/create-decorated-definition.js';
import { OverridesConfigBuilder } from '../shared/OverridesConfigBuilder.js';

export class ScopeConfigurationBuilder implements ScopeConfigurable {
  private readonly _allowedLifeTimes = [LifeTime.scoped, LifeTime.transient, LifeTime.cascading];

  constructor(
    private _currentContainer: IContainer & IStrategyAware,
    private _bindingsRegistry: BindingsRegistry,
    private _tags: (string | symbol)[],
    private _disposeFns: Array<(scope: IContainer) => void>,
    private _scopeInitializationFns: Array<(scope: IContainer) => MaybePromise<void>> = [],
  ) {}

  eager<TInstance, TLifeTime extends LifeTime>(def: IDefinitionSymbol<TInstance, TLifeTime>): unknown {
    this._scopeInitializationFns.push(use => {
      use(def);
    });
  }

  add<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionSymbol<TInstance, TLifeTime>,
  ): SymbolsRegistrationBuilder<TInstance, TLifeTime> {
    return new SymbolsRegistrationBuilder(
      symbol,
      this._bindingsRegistry,
      this._allowedLifeTimes,
      (definition: IDefinition<TInstance, TLifeTime>) => {
        this._bindingsRegistry.register(symbol, definition, this._currentContainer);
      },
    );
  }

  own<TInstance>(
    symbol: DefinitionSymbol<TInstance, LifeTime.cascading>,
  ): OwningDefinitionBuilder<TInstance, LifeTime.cascading> {
    this._bindingsRegistry.ownCascading(symbol, this._currentContainer);

    return new OwningDefinitionBuilder(symbol, this._bindingsRegistry);
  }

  onDispose(callback: (scope: IContainer) => void): void {
    this._disposeFns.push(callback);
  }

  configure<TInstance>(
    symbol: IDefinitionSymbol<TInstance, ScopeConfigureAllowedLifeTimes>,
    configFn: (instance: TInstance) => MaybePromise<void>,
  ): void {
    const configuredDefinition = createConfiguredDefinition(this._bindingsRegistry, symbol, configFn, []);

    this._bindingsRegistry.override(configuredDefinition);
  }

  decorate<TInstance>(
    symbol: IDefinitionSymbol<TInstance, ScopeConfigureAllowedLifeTimes>,
    configFn: (instance: TInstance) => MaybePromise<TInstance>,
  ): void {
    const configuredDefinition = createDecoratedDefinition(this._bindingsRegistry, symbol, configFn, []);

    this._bindingsRegistry.override(configuredDefinition);
  }

  override<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): OverridesConfigBuilder<TInstance, TLifeTime> {
    return new OverridesConfigBuilder(
      symbol,
      this._bindingsRegistry,
      this._allowedLifeTimes,
      (definition: IDefinition<TInstance, TLifeTime>) => {
        this._bindingsRegistry.override(definition);
      },
    );
  }
}
