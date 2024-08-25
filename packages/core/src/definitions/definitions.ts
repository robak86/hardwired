import { LifeTime } from './abstract/LifeTime.js';

import { fnDefinition, transientFn } from './abstract/FnDefinition.js';
import { container } from '../container/Container.js';

export const fn = Object.assign(transientFn, {
  singleton: fnDefinition(LifeTime.singleton),
  scoped: fnDefinition(LifeTime.scoped),
});

const a = fn((use, userId: number) => {
  return 123;
});

const value = a(123);

const use = container();

const value2 = use(a);
