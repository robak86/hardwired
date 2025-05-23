import type { IDisposeFinalizer } from '../../../abstract/IDisposeFinalizer.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { MaybePromise } from '../../../../utils/async.js';
import type { IDefinitionToken } from '../../../../definitions/def-symbol.js';

import type { IConfigurationContext } from './abstract/IConfigurationContext.js';

export class DisposeFinalizeBuilder<TInstance, TLifeTime extends LifeTime>
  implements IDisposeFinalizer<TInstance, TLifeTime>
{
  constructor(
    private _symbol: IDefinitionToken<TInstance, TLifeTime>,
    private _context: IConfigurationContext,
  ) {}

  onDispose(disposeFn: (instance: TInstance) => MaybePromise<void>): void {
    this._context.addDefinitionDisposeFn(this._symbol, disposeFn);
  }
}
