import { LifeTime } from './abstract/LifeTime.js';
import { buildDefine } from '../builder/buildDefine.js';

export const singleton = buildDefine({
  lifeTime: LifeTime.singleton,
  include: {},
});

export const transient = buildDefine({
  lifeTime: LifeTime.transient,
  include: {},
});

export const scoped = buildDefine({
  lifeTime: LifeTime.scoped,
  include: {},
});
