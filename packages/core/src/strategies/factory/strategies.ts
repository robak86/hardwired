import { classRequest, classScoped, classSingleton, classTransient } from './classStrategies';
import { ServiceLocator } from '../../container/ServiceLocator';
import { ServiceLocatorStrategy } from '../ServiceLocatorStrategy';
import { requestFn, scopedFn, singletonFn, transientFn } from './fnStrategies';
import { classDefinition } from '../abstract/InstanceDefinition/ClassInstanceDefinition';
import { ConstDefinition } from '../abstract/InstanceDefinition/ConstDefinition';
import { ConstStrategy } from '../ConstStrategy';
import { v4 } from 'uuid';


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

export const value = <TValue, TDeps extends any[]>(value: TValue): ConstDefinition<TValue> => {
  return {
    id: v4(),
    type: 'const',
    strategy: ConstStrategy.type,
    value,
  };
};
