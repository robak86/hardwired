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
import { SingletonStrategy } from '../strategies/SingletonStrategy';
import { classDefinition } from './InstanceEntry';
import { ServiceLocator } from '../container/ServiceLocator';
import { ServiceLocatorStrategy } from "../strategies/ServiceLocatorStrategy";

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
