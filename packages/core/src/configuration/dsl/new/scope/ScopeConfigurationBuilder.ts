import { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { IScopeConfigurable, ScopeConfigureAllowedLifeTimes } from '../../../abstract/IScopeConfigurable.js';
import type { IContainer } from '../../../../container/IContainer.js';
import { AddDefinitionBuilder } from '../shared/AddDefinitionBuilder.js';
import { CascadingModifyBuilder } from '../shared/CascadingModifyBuilder.js';
import { ModifyDefinitionBuilder } from '../shared/ModifyDefinitionBuilder.js';
import type { ScopeModifyBuilderType } from '../../../abstract/IModifyAware.js';
import { ConfigurationBuildersContext } from '../shared/context/ConfigurationBuildersContext.js';
import type { IContainerConfiguration } from '../container/ContainerConfiguration.js';
import type { DefinitionToken, IDefinitionToken } from '../../../../definitions/DefinitionToken.js';
import type { IInitBuilder } from '../../../abstract/IInitBuilder.js';
import { InitDefinitionBuilder } from '../shared/InitDefinitionBuilder.js';

export class ScopeConfigurationBuilder implements IScopeConfigurable {
  private readonly _allowedRegistrationLifeTimes = [LifeTime.scoped, LifeTime.transient, LifeTime.cascading];
  private readonly _modifyAllowedLifeTimes = [LifeTime.scoped, LifeTime.transient];
  private readonly _cascadingModifyAllowedLifeTimes = [LifeTime.scoped, LifeTime.transient, LifeTime.cascading];
  private readonly _initAllowedLifeTimes = [
    LifeTime.scoped,
    LifeTime.transient,
    LifeTime.cascading,
    LifeTime.singleton,
  ];

  private _context = ConfigurationBuildersContext.create();

  toConfig(): IContainerConfiguration {
    return this._context.toConfig();
  }

  // TODO: replace this callback functions with some minimal interface
  modify<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes>(
    symbol: IDefinitionToken<TInstance, TLifeTime>,
  ): ScopeModifyBuilderType<TInstance, TLifeTime> {
    if (symbol.strategy === LifeTime.cascading) {
      return new CascadingModifyBuilder<TInstance, []>(
        'modify',
        symbol as IDefinitionToken<TInstance, LifeTime.cascading>,
        this._cascadingModifyAllowedLifeTimes,
        this._context,
        [],
      ) as any;
    } else {
      return new ModifyDefinitionBuilder<TInstance, TLifeTime, []>(
        'modify',
        symbol,
        this._modifyAllowedLifeTimes,
        this._context,
        [],
      ) as any;
    }
  }

  add<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionToken<TInstance, TLifeTime>,
  ): AddDefinitionBuilder<TInstance, TLifeTime, []> {
    return new AddDefinitionBuilder('add', symbol, this._allowedRegistrationLifeTimes, this._context, []);
  }

  onDispose(callback: (scope: IContainer) => void): void {
    this._context.onDispose(callback);
  }

  init<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes>(
    token: IDefinitionToken<TInstance, TLifeTime>,
  ): IInitBuilder<TInstance, TLifeTime, []> {
    return new InitDefinitionBuilder<TInstance, TLifeTime, []>(token, this._initAllowedLifeTimes, this._context, []);
  }
}
