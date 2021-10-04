import { ServiceLocator } from '../../container/ServiceLocator';
import { ServiceLocatorStrategy } from '../ServiceLocatorStrategy';
import { fnDefinition, partiallyAppliedDefinition } from './fnStrategies';
import { buildClassDefinition } from '../abstract/InstanceDefinition/BuildClassDefinition';
import { ConstDefinition } from '../abstract/InstanceDefinition/ConstDefinition';
import { ConstStrategy } from '../ConstStrategy';
import { v4 } from 'uuid';

import { asyncFnDefinition, asyncPartiallyAppliedDefinition } from './asyncFnStrategies';
import { classDefinition } from './classStrategies';
import { SingletonStrategy } from '../SingletonStrategy';
import { TransientStrategy } from '../TransientStrategy';
import { RequestStrategy } from '../RequestStrategy';
import { ScopeStrategy } from '../ScopeStrategy';
import { asyncClassDefinition } from './asyncClassStrategies';
import { AsyncSingletonStrategy } from '../AsyncSingletonStrategy';

export const singleton = {
  fn: fnDefinition(SingletonStrategy.type),
  class: classDefinition(SingletonStrategy.type),
  partial: partiallyAppliedDefinition(SingletonStrategy.type),

  asyncFn: asyncFnDefinition(AsyncSingletonStrategy.type),
  asyncClass: asyncClassDefinition(AsyncSingletonStrategy.type),
  asyncPartial: asyncPartiallyAppliedDefinition(AsyncSingletonStrategy.type),
};

export const transient = {
  fn: fnDefinition(TransientStrategy.type),
  class: classDefinition(TransientStrategy.type),
  partial: partiallyAppliedDefinition(TransientStrategy.type),
};

export const request = {
  fn: fnDefinition(RequestStrategy.type),
  class: classDefinition(RequestStrategy.type),
  partial: partiallyAppliedDefinition(RequestStrategy.type),
};

export const scoped = {
  fn: fnDefinition(ScopeStrategy.type),
  class: classDefinition(ScopeStrategy.type),
  partial: partiallyAppliedDefinition(ScopeStrategy.type),
};

export const serviceLocator = buildClassDefinition(ServiceLocator, ServiceLocatorStrategy.type, [] as any);

export const value = <TValue, TDeps extends any[]>(value: TValue): ConstDefinition<TValue> => {
  return {
    id: v4(),
    type: 'const',
    strategy: ConstStrategy.type,
    value,
  };
};
