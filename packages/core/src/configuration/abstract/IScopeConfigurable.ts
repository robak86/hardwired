import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IContainer } from '../../container/IContainer.js';
import type { MaybePromise } from '../../utils/async.js';

import type { IRegisterAware } from './IRegisterAware.js';
import type { IScopeModifyAware } from './IModifyAware.js';
import type { IEagerInstantiationAware } from './IEagerInstantiationAware.js';

export type ScopeConfigureAllowedLifeTimes = LifeTime.transient | LifeTime.scoped | LifeTime.cascading;
export type ScopeOverrideAllowedLifeTimes = LifeTime.transient | LifeTime.scoped;

export interface IScopeConfigurable
  extends IRegisterAware<ScopeConfigureAllowedLifeTimes>,
    IScopeModifyAware<ScopeConfigureAllowedLifeTimes>,
    IEagerInstantiationAware<ScopeConfigureAllowedLifeTimes> {
  onDispose(callback: (scope: IContainer) => MaybePromise<void>): void;
}
