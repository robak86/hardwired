import { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { IScopeConfigurable, ScopeConfigureAllowedLifeTimes } from '../../../abstract/IScopeConfigurable.js';
import type { ICascadingDefinitionResolver, IContainer, IStrategyAware } from '../../../../container/IContainer.js';
import type { BindingsRegistry } from '../../../../context/BindingsRegistry.js';
import type { DefinitionSymbol, IDefinitionSymbol } from '../../../../definitions/def-symbol.js';
import type { MaybePromise } from '../../../../utils/async.js';
import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import { AddDefinitionBuilder } from '../shared/AddDefinitionBuilder.js';
import { CascadingModifyBuilder } from '../shared/CascadingModifyBuilder.js';
import { ModifyDefinitionBuilder } from '../shared/ModifyDefinitionBuilder.js';
import type { IConfigureBuilder, ScopeModifyBuilderType } from '../../../abstract/IModifyAware.js';

export class ScopeConfigurationBuilder implements IScopeConfigurable {
  private readonly _allowedRegistrationLifeTimes = [LifeTime.scoped, LifeTime.transient, LifeTime.cascading];
  private readonly _modifyAllowedLifeTimes = [LifeTime.scoped, LifeTime.transient];
  private readonly _cascadingModifyAllowedLifeTimes = [LifeTime.scoped, LifeTime.transient, LifeTime.cascading];

  constructor(
    private _currentContainer: IContainer & IStrategyAware & ICascadingDefinitionResolver,
    private _bindingsRegistry: BindingsRegistry,
    private _tags: (string | symbol)[],
    private _disposeFns: Array<(scope: IContainer) => void>,
    // @ts-ignore
    private _scopeInitializationFns: Array<(scope: IContainer) => MaybePromise<void>> = [],
  ) {}

  setTags(tags: (string | symbol)[]): void {
    this._tags.push(...tags);
  }

  // TODO: replace this callback functions with some minimal interface
  modify<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): ScopeModifyBuilderType<TInstance, TLifeTime> {
    if (symbol.strategy === LifeTime.cascading) {
      return new CascadingModifyBuilder<TInstance>(
        symbol as IDefinitionSymbol<TInstance, LifeTime.cascading>,
        this._bindingsRegistry,
        this._cascadingModifyAllowedLifeTimes,
        (definition: IDefinition<TInstance, LifeTime.cascading>) => {
          this._bindingsRegistry.setCascadeRoot(definition, this._currentContainer);
          this._bindingsRegistry.override(definition);
        },
        (cascadingSymbol: DefinitionSymbol<TInstance, LifeTime.cascading>) => {
          this._bindingsRegistry.setCascadeRoot(cascadingSymbol, this._currentContainer);
        },
      ) as any;
    } else {
      return new ModifyDefinitionBuilder<TInstance, TLifeTime>(
        symbol,
        this._bindingsRegistry,
        this._modifyAllowedLifeTimes,
        (definition: IDefinition<TInstance, TLifeTime>) => {
          this._bindingsRegistry.override(definition);
        },
      ) as any;
    }
  }

  eager<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes>(
    def: IDefinitionSymbol<TInstance, TLifeTime>,
  ): IConfigureBuilder<TInstance, TLifeTime> {
    // this._scopeInitializationFns.push(use => {
    //   use(def);
    // });

    throw new Error('Implement me!');
  }

  add<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionSymbol<TInstance, TLifeTime>,
  ): AddDefinitionBuilder<TInstance, TLifeTime> {
    return new AddDefinitionBuilder(
      symbol,
      this._bindingsRegistry,
      this._allowedRegistrationLifeTimes,
      (definition: IDefinition<TInstance, TLifeTime>) => {
        this._bindingsRegistry.register(symbol, definition, this._currentContainer);
      },
    );
  }

  onDispose(callback: (scope: IContainer) => void): void {
    this._disposeFns.push(callback);
  }
}
