import type { MaybePromise } from '../../../../utils/async.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { ICascadeModifyBuilder } from '../../../abstract/IModifyAware.js';
import type { IDefinitionSymbol } from '../../../../definitions/def-symbol.js';
import type { BindingsRegistry } from '../../../../context/BindingsRegistry.js';
import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import { createInheritedDefinition } from '../utils/create-inherited-definition.js';

import { ModifyDefinitionBuilder } from './ModifyDefinitionBuilder.js';

export class CascadingModifyBuilder<TInstance>
  extends ModifyDefinitionBuilder<TInstance, LifeTime.cascading>
  implements ICascadeModifyBuilder<TInstance>
{
  constructor(
    defSymbol: IDefinitionSymbol<TInstance, LifeTime.cascading>,
    registry: BindingsRegistry,
    allowedLifeTimes: LifeTime[],
    onDefinition: (definition: IDefinition<TInstance, LifeTime.cascading>) => void,
    protected _onCascadingDefinition: (definition: IDefinitionSymbol<TInstance, LifeTime.cascading>) => void,
  ) {
    super(defSymbol, registry, allowedLifeTimes, onDefinition);
  }

  cascade() {
    this._onCascadingDefinition(this._defSymbol);
  }

  inherit(decorateFn: (instance: TInstance) => MaybePromise<TInstance>) {
    if (this._registry.hasCascadingRoot(this._defSymbol.id)) {
      throw new Error('Cannot inherit cascading definition. Current scope already provides own definition.');
    }

    const baseDefinition = this._registry.getDefinitionForOverride(this._defSymbol);

    const decorate = createInheritedDefinition(baseDefinition, decorateFn, []);

    this._onDefinition(decorate);
  }
}
