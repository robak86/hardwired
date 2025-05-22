import { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { IScopeConfigurable, ScopeConfigureAllowedLifeTimes } from '../../../abstract/IScopeConfigurable.js';
import type { IContainer } from '../../../../container/IContainer.js';
import type { DefinitionSymbol, IDefinitionSymbol } from '../../../../definitions/def-symbol.js';
import { AddDefinitionBuilder } from '../shared/AddDefinitionBuilder.js';
import { CascadingModifyBuilder } from '../shared/CascadingModifyBuilder.js';
import { ModifyDefinitionBuilder } from '../shared/ModifyDefinitionBuilder.js';
import type { IConfigureBuilder, ScopeModifyBuilderType } from '../../../abstract/IModifyAware.js';
import { ConfigurationBuildersContext } from '../shared/context/ConfigurationBuildersContext.js';
import { ScopeConfiguration } from '../container/ContainerConfiguration.js';

export class ScopeConfigurationBuilder implements IScopeConfigurable {
  private readonly _allowedRegistrationLifeTimes = [LifeTime.scoped, LifeTime.transient, LifeTime.cascading];
  private readonly _modifyAllowedLifeTimes = [LifeTime.scoped, LifeTime.transient];
  private readonly _cascadingModifyAllowedLifeTimes = [LifeTime.scoped, LifeTime.transient, LifeTime.cascading];

  private _context = ConfigurationBuildersContext.create();

  toConfig(): ScopeConfiguration {
    return new ScopeConfiguration(this._context);
  }

  // TODO: replace this callback functions with some minimal interface
  modify<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): ScopeModifyBuilderType<TInstance, TLifeTime> {
    if (symbol.strategy === LifeTime.cascading) {
      return new CascadingModifyBuilder<TInstance>(
        'modify',
        symbol as IDefinitionSymbol<TInstance, LifeTime.cascading>,
        this._cascadingModifyAllowedLifeTimes,
        this._context,
      ) as any;
    } else {
      return new ModifyDefinitionBuilder<TInstance, TLifeTime>(
        'modify',
        symbol,
        this._modifyAllowedLifeTimes,
        this._context,
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
    return new AddDefinitionBuilder('add', symbol, this._allowedRegistrationLifeTimes, this._context);
  }

  onDispose(callback: (scope: IContainer) => void): void {
    this._context.onDispose(callback);
  }
}
