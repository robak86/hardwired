import { classRequest, classScoped, classSingleton, classTransient } from './classStrategies';
import { ServiceLocator } from '../../container/ServiceLocator';
import { ServiceLocatorStrategy } from '../ServiceLocatorStrategy';
import {
  partiallyAppliedRequest,
  partiallyAppliedScoped,
  partiallyAppliedSingleton,
  partiallyAppliedTransient,
  requestFn,
  scopedFn,
  singletonFn,
  transientFn,
} from './fnStrategies';
import { classDefinition } from '../abstract/InstanceDefinition/ClassInstanceDefinition';
import { ConstDefinition } from '../abstract/InstanceDefinition/ConstDefinition';
import { ConstStrategy } from '../ConstStrategy';
import { v4 } from 'uuid';

export const singleton = {
  fn: singletonFn,
  class: classSingleton,
  partial: partiallyAppliedSingleton,
};

export const transient = {
  fn: transientFn,
  class: classTransient,
  partial: partiallyAppliedTransient,
};

export const request = {
  fn: requestFn,
  class: classRequest,
  partial: partiallyAppliedRequest,
};

export const scoped = {
  fn: scopedFn,
  class: classScoped,
  partial: partiallyAppliedScoped,
};

export const serviceLocator = classDefinition(ServiceLocator, ServiceLocatorStrategy.type, [] as any);

export const value = <TValue, TDeps extends any[]>(value: TValue): ConstDefinition<TValue> => {
  return {
    id: v4(),
    type: 'const',
    strategy: ConstStrategy.type,
    value,
  };
};
