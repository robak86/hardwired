import { fn } from './sync/fn';
import { partial } from './sync/partial';
import { klass } from './sync/klass';
import { asyncFn } from './async/asyncFn';
import { asyncClass } from './async/asyncClass';
import { asyncPartial } from './async/asyncPartial';
import { LifeTime } from './abstract/LifeTime';

export const singleton = {
  fn: fn(LifeTime.singleton),
  class: klass(LifeTime.singleton),
  partial: partial(LifeTime.singleton),

  asyncFn: asyncFn(LifeTime.singleton),
  asyncClass: asyncClass(LifeTime.singleton),
  asyncPartial: asyncPartial(LifeTime.singleton),
};

export const transient = {
  fn: fn(LifeTime.transient),
  class: klass(LifeTime.transient),
  partial: partial(LifeTime.transient),

  asyncFn: asyncFn(LifeTime.transient),
  asyncClass: asyncClass(LifeTime.transient),
  asyncPartial: asyncPartial(LifeTime.transient),
};

export const request = {
  fn: fn(LifeTime.request),
  class: klass(LifeTime.request),
  partial: partial(LifeTime.request),

  asyncFn: asyncFn(LifeTime.request),
  asyncClass: asyncClass(LifeTime.request),
  asyncPartial: asyncPartial(LifeTime.request),
};

export const scoped = {
  fn: fn(LifeTime.scoped),
  class: klass(LifeTime.scoped),
  partial: partial(LifeTime.scoped),

  asyncFn: asyncFn(LifeTime.scoped),
  asyncClass: asyncClass(LifeTime.scoped),
  asyncPartial: asyncPartial(LifeTime.scoped),
};
