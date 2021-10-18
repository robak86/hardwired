import { fn } from './sync/fn';
import { partial } from './sync/partial';
import { klass } from './sync/klass';
import { asyncFn } from './async/asyncFn';
import { asyncClass } from './async/asyncClass';
import { asyncPartial } from './async/asyncPartial';
import { LifeTime } from './abstract/LifeTime';
import { define } from './sync/define';
import { asyncDefine } from './async/asyncDefine';

export const singleton = {
  fn: fn(LifeTime.singleton),
  class: klass(LifeTime.singleton),
  partial: partial(LifeTime.singleton),
  define: define(LifeTime.singleton),

  asyncFn: asyncFn(LifeTime.singleton),
  asyncClass: asyncClass(LifeTime.singleton),
  asyncPartial: asyncPartial(LifeTime.singleton),
  asyncDefine: asyncDefine(LifeTime.singleton),
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

export const request = {
  fn: fn(LifeTime.request),
  class: klass(LifeTime.request),
  partial: partial(LifeTime.request),
  define: define(LifeTime.request),

  asyncFn: asyncFn(LifeTime.request),
  asyncClass: asyncClass(LifeTime.request),
  asyncPartial: asyncPartial(LifeTime.request),
  asyncDefine: asyncDefine(LifeTime.request),
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
