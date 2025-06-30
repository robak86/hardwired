import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IContainer } from '../../container/IContainer.js';
import type { MaybePromise } from '../../utils/async.js';
import type { IDefinitionToken } from '../../definitions/DefinitionToken.js';

import type { IRegisterAware } from './IRegisterAware.js';
import type { IScopeModifyAware } from './IModifyAware.js';
import type { IInitBuilder } from './IInitBuilder.js';

export type ScopeConfigureAllowedLifeTimes = LifeTime.transient | LifeTime.scoped | LifeTime.cascading;

export interface IScopeConfigurable
  extends IRegisterAware<ScopeConfigureAllowedLifeTimes>,
    IScopeModifyAware<ScopeConfigureAllowedLifeTimes> {
  onDispose(callback: (scope: IContainer) => MaybePromise<void>): void;

  init<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes>(
    token: IDefinitionToken<TInstance, TLifeTime>,
  ): IInitBuilder<TInstance, TLifeTime, []>;
}
