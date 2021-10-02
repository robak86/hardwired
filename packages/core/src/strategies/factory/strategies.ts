import {
  classRequest,
  classScoped,
  classSingleton,
  classTransient,
  requestFn,
  scopedFn,
  singletonFn,
  transientFn,
} from './classStrategies';
import { classDefinition } from '../../new/InstanceDefinition';
import { ServiceLocator } from '../../container/ServiceLocator';
import { ServiceLocatorStrategy } from '../ServiceLocatorStrategy';

export const singleton = {
  fn: singletonFn,
  class: classSingleton,
};

export const transient = {
  fn: transientFn,
  class: classTransient,
};

export const request = {
  fn: requestFn,
  class: classRequest,
};

export const scoped = {
  fn: scopedFn,
  class: classScoped,
};

export const serviceLocator = classDefinition(ServiceLocator, ServiceLocatorStrategy.type, [] as any);
