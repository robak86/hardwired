import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { ICascadeModifyBuilder } from '../../../abstract/IModifyAware.js';
import { InheritedDefinitionBuilder } from '../utils/InheritedDefinitionBuilder.js';
import type { IDefinitionToken } from '../../../../definitions/DefinitionToken.js';

import { ModifyDefinitionBuilder } from './ModifyDefinitionBuilder.js';
import type { ConfigurationType, IConfigurationContext } from './abstract/IConfigurationContext.js';
import { DisposeFinalizeBuilder } from './DisposeFinalizeBuilder.js';

export class CascadingModifyBuilder<TInstance>
  extends ModifyDefinitionBuilder<TInstance, LifeTime.cascading>
  implements ICascadeModifyBuilder<TInstance>
{
  constructor(
    protected readonly _configType: ConfigurationType,
    symbol: IDefinitionToken<TInstance, LifeTime.cascading>,
    allowedLifeTimes: LifeTime[],
    context: IConfigurationContext,
  ) {
    super(_configType, symbol, allowedLifeTimes, context);
  }

  claimNew() {
    this._context.onCascadingDefinition(this._token);
  }

  inherit(decorateFn: (instance: TInstance) => TInstance) {
    const inheritedDefinitionBuilder = new InheritedDefinitionBuilder(this._token, decorateFn, []);

    this._context.onInheritBuilder(this._configType, inheritedDefinitionBuilder);

    return new DisposeFinalizeBuilder(this._token, this._context);
  }
}
