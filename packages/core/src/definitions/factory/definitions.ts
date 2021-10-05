import { ServiceLocator } from '../../container/ServiceLocator';
import { ServiceLocatorStrategy } from '../../strategies/ServiceLocatorStrategy';
import { v4 } from 'uuid';
import { SingletonStrategy } from '../../strategies/SingletonStrategy';
import { TransientStrategy } from '../../strategies/TransientStrategy';
import { RequestStrategy } from '../../strategies/RequestStrategy';
import { ScopeStrategy } from '../../strategies/ScopeStrategy';
import { AsyncSingletonStrategy } from '../../strategies/AsyncSingletonStrategy';
import { buildClassDefinition, InstanceDefinition } from '../InstanceDefinition';
import { definition } from './customDefinitions';

export const singleton = {
  fn: definition.fn(SingletonStrategy.type),
  class: definition.class(SingletonStrategy.type),
  partial: definition.partial(SingletonStrategy.type),

  asyncFn: definition.asyncFn(AsyncSingletonStrategy.type),
  asyncClass: definition.asyncClass(AsyncSingletonStrategy.type),
  asyncPartial: definition.asyncPartial(AsyncSingletonStrategy.type),
};

export const transient = {
  fn: definition.fn(TransientStrategy.type),
  class: definition.class(TransientStrategy.type),
  partial: definition.partial(TransientStrategy.type),
};

export const request = {
  fn: definition.fn(RequestStrategy.type),
  class: definition.class(RequestStrategy.type),
  partial: definition.partial(RequestStrategy.type),
};

export const scoped = {
  fn: definition.fn(ScopeStrategy.type),
  class: definition.class(ScopeStrategy.type),
  partial: definition.partial(ScopeStrategy.type),
};

export const serviceLocator = buildClassDefinition(ServiceLocator, ServiceLocatorStrategy.type, [] as any);

export const value = <TValue, TDeps extends any[]>(value: TValue): InstanceDefinition<TValue> => {
  return {
    id: v4(),
    strategy: SingletonStrategy.type,
    create: () => value,
    dependencies: [],
    meta: undefined,
  };
};
