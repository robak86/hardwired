import { LifeTime } from './abstract/LifeTime.js';

import { fnDefinition, transientFn } from './abstract/FnDefinition.js';

export const fn = Object.assign(transientFn, {
  singleton: fnDefinition(LifeTime.singleton),
  scoped: fnDefinition(LifeTime.scoped),
});
