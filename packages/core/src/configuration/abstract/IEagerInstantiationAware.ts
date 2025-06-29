import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { MaybePromise } from '../../utils/async.js';
import type { IDefinitionToken } from '../../definitions/DefinitionToken.js';

import type { IConfigureBuilder, IDecoratedBuilder } from './IModifyAware.js';

export interface IEagerConfigurable<TInstance, TAllowedLifeTime extends LifeTime>
  extends IConfigureBuilder<TInstance, TAllowedLifeTime, []>,
    IDecoratedBuilder<TInstance, TAllowedLifeTime, []> {}

export interface IEagerInstantiationAware<TAllowedLifeTime extends LifeTime> {
  eager<TInstance, TLifeTime extends TAllowedLifeTime>(
    def: IDefinitionToken<TInstance, TLifeTime>,
  ): IEagerConfigurable<MaybePromise<TInstance>, TLifeTime>;
}
