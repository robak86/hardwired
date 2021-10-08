import { SingletonStrategy } from '../strategies/sync/SingletonStrategy';
import { TransientStrategy } from '../strategies/sync/TransientStrategy';
import { RequestStrategy } from '../strategies/sync/RequestStrategy';
import { ScopeStrategy } from '../strategies/sync/ScopeStrategy';
import { AsyncSingletonStrategy } from '../strategies/async/AsyncSingletonStrategy';
import { fn } from './sync/fn';
import { partial } from './sync/partial';
import { klass } from './sync/klass';
import { asyncFn } from './async/asyncFn';
import { asyncClass } from './async/asyncClass';
import { asyncPartial } from './async/asyncPartial';
import { AsyncTransientStrategy } from '../strategies/async/AsyncTransientStrategy';
import { AsyncRequestStrategy } from '../strategies/async/AsyncRequestStrategy';
import { AsyncScopedStrategy } from '../strategies/async/AsyncScopedStrategy';

export const singleton = {
  fn: fn(SingletonStrategy.type),
  class: klass(SingletonStrategy.type),
  partial: partial(SingletonStrategy.type),

  asyncFn: asyncFn(AsyncSingletonStrategy.type),
  asyncClass: asyncClass(AsyncSingletonStrategy.type),
  asyncPartial: asyncPartial(AsyncSingletonStrategy.type),
};

export const transient = {
  fn: fn(TransientStrategy.type),
  class: klass(TransientStrategy.type),
  partial: partial(TransientStrategy.type),

  asyncFn: asyncFn(AsyncTransientStrategy.type),
  asyncClass: asyncClass(AsyncTransientStrategy.type),
  asyncPartial: asyncPartial(AsyncTransientStrategy.type),
};

export const request = {
  fn: fn(RequestStrategy.type),
  class: klass(RequestStrategy.type),
  partial: partial(RequestStrategy.type),

  asyncFn: asyncFn(AsyncRequestStrategy.type),
  asyncClass: asyncClass(AsyncRequestStrategy.type),
  asyncPartial: asyncPartial(AsyncRequestStrategy.type),
};

export const scoped = {
  fn: fn(ScopeStrategy.type),
  class: klass(ScopeStrategy.type),
  partial: partial(ScopeStrategy.type),

  asyncFn: asyncFn(AsyncScopedStrategy.type),
  asyncClass: asyncClass(AsyncScopedStrategy.type),
  asyncPartial: asyncPartial(AsyncScopedStrategy.type),
};
