import { LifeTime } from './abstract/LifeTime.js';
import { DefineFn } from '../builder/buildContext.js';
import { InstanceDefinition } from './abstract/InstanceDefinition.js';
import { v4 } from 'uuid';

export const singleton = <TInstance>(defineFn: DefineFn<TInstance, LifeTime.singleton, {}>) => {
  return new InstanceDefinition(v4(), LifeTime.singleton, defineFn);
};

export const transient = <TInstance>(defineFn: DefineFn<TInstance, LifeTime.transient, {}>) => {
  return new InstanceDefinition(v4(), LifeTime.transient, defineFn);
};

export const scoped = <TInstance>(defineFn: DefineFn<TInstance, LifeTime.scoped, {}>) => {
  return new InstanceDefinition(v4(), LifeTime.scoped, defineFn);
};
