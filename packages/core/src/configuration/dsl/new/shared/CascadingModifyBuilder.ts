import type { MaybePromise } from '../../../../utils/async.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { ICascadeModifyBuilder } from '../../../abstract/IModifyAware.js';
import type { IDefinitionSymbol } from '../../../../definitions/def-symbol.js';
import type { BindingsRegistry } from '../../../../context/BindingsRegistry.js';
import { InheritedDefinitionBuilder } from '../utils/InheritedDefinitionBuilder.js';

import { ModifyDefinitionBuilder } from './ModifyDefinitionBuilder.js';
import type { ConfigurationType, IConfigurationContext } from './abstract/IConfigurationContext.js';

export class CascadingModifyBuilder<TInstance>
  extends ModifyDefinitionBuilder<TInstance, LifeTime.cascading>
  implements ICascadeModifyBuilder<TInstance>
{
  constructor(
    protected readonly _configType: ConfigurationType,

    defSymbol: IDefinitionSymbol<TInstance, LifeTime.cascading>,
    registry: BindingsRegistry,
    allowedLifeTimes: LifeTime[],
    context: IConfigurationContext,
  ) {
    super(_configType, defSymbol, registry, allowedLifeTimes, context);
  }

  claimNew() {
    this._configurationContext.onCascadingDefinition(this._defSymbol);
  }

  inherit(decorateFn: (instance: TInstance) => MaybePromise<TInstance>) {
    const inheritedDefinitionBuilder = new InheritedDefinitionBuilder(this._defSymbol, decorateFn, []);

    this._configurationContext.onInheritBuilder(this._configType, inheritedDefinitionBuilder);
  }
}
