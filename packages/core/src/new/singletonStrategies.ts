import {
  classRequest,
  classScoped,
  classSingleton,
  classTransient,
  requestFn, scopedFn,
  singletonFn,
  transientFn
} from './classStrategies';

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
