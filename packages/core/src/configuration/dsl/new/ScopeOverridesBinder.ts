import type { LifeTime } from '../../../definitions/abstract/LifeTime.js';

import { ScopeSymbolBinder } from './ScopeSymbolBinder.js';

export class ScopeOverridesBinder<TInstance, TLifeTime extends LifeTime> extends ScopeSymbolBinder<
  TInstance,
  TLifeTime
> {}
