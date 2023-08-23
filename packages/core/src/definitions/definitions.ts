import { fn } from './sync/fn.js';
import { partial } from './sync/partial.js';
import { klass } from './sync/klass.js';
import { asyncFn } from './async/asyncFn.js';
import { asyncClass } from './async/asyncClass.js';
import { asyncPartial } from './async/asyncPartial.js';
import { LifeTime } from './abstract/LifeTime.js';
import { define } from './sync/define.js';
import { asyncDefine } from './async/asyncDefine.js';
import { serializableClass } from './sync/serializableClass.js';

export const singleton = {
  fn: fn(LifeTime.singleton),
  class: klass(LifeTime.singleton),
  partial: partial(LifeTime.singleton),
  define: define(LifeTime.singleton),
  asyncFn: asyncFn(LifeTime.singleton),
  asyncClass: asyncClass(LifeTime.singleton),
  asyncPartial: asyncPartial(LifeTime.singleton),
  asyncDefine: asyncDefine(LifeTime.singleton),
  serializableClass: serializableClass(LifeTime.singleton),
};

export const transient = {
  fn: fn(LifeTime.transient),
  class: klass(LifeTime.transient),
  partial: partial(LifeTime.transient),
  define: define(LifeTime.transient),

  asyncFn: asyncFn(LifeTime.transient),
  asyncClass: asyncClass(LifeTime.transient),
  asyncPartial: asyncPartial(LifeTime.transient),
  asyncDefine: asyncDefine(LifeTime.transient),
};

export const scoped = {
  fn: fn(LifeTime.scoped),
  class: klass(LifeTime.scoped),
  partial: partial(LifeTime.scoped),
  define: define(LifeTime.scoped),
  asyncFn: asyncFn(LifeTime.scoped),
  asyncClass: asyncClass(LifeTime.scoped),
  asyncPartial: asyncPartial(LifeTime.scoped),
  asyncDefine: asyncDefine(LifeTime.scoped),
};
