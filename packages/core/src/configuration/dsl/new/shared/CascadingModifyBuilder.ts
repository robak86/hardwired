import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { ICascadeModifyBuilder } from '../../../abstract/IModifyAware.js';
import { InheritedDefinitionBuilder } from '../utils/InheritedDefinitionBuilder.js';
import type { IDefinitionToken } from '../../../../definitions/DefinitionToken.js';
import type { ValidDependenciesLifeTime } from '../../../../definitions/abstract/InstanceDefinitionDependency.js';
import type { AwaitedInstanceArray } from '../../../../container/Container.js';

import { ModifyDefinitionBuilder } from './ModifyDefinitionBuilder.js';
import type { ConfigurationType, IConfigurationContext } from './abstract/IConfigurationContext.js';
import { DisposeFinalizeBuilder } from './DisposeFinalizeBuilder.js';

export class CascadingModifyBuilder<
    TInstance,
    TDependencies extends IDefinitionToken<any, ValidDependenciesLifeTime<LifeTime.cascading>>[],
  >
  extends ModifyDefinitionBuilder<TInstance, LifeTime.cascading, TDependencies>
  implements ICascadeModifyBuilder<TInstance, TDependencies>
{
  constructor(
    protected readonly _configType: ConfigurationType,
    symbol: IDefinitionToken<TInstance, LifeTime.cascading>,
    allowedLifeTimes: LifeTime[],
    context: IConfigurationContext,
    dependencies: TDependencies,
  ) {
    super(_configType, symbol, allowedLifeTimes, context, dependencies);
  }

  claimNew() {
    this._context.onCascadingDefinition(this._token);
  }

  inherit(decorateFn: (instance: TInstance, ...deps: AwaitedInstanceArray<TDependencies>) => TInstance) {
    const inheritedDefinitionBuilder = new InheritedDefinitionBuilder(
      this._token,
      this._dependencies as any,
      decorateFn,
    );

    this._context.onInheritBuilder(this._configType, inheritedDefinitionBuilder);

    return new DisposeFinalizeBuilder(this._token, this._context);
  }
}
