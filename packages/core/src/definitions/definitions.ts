import { LifeTime } from './abstract/LifeTime.js';
import { DefineClbk } from '../builder/buildDefine.js';
import { InstanceDefinition } from './abstract/sync/InstanceDefinition.js';
import { v4 } from 'uuid';

export const singleton = <TInstance>(defineFn: DefineClbk<TInstance, LifeTime.singleton, {}>) => {
  return new InstanceDefinition(v4(), LifeTime.singleton, defineFn);
};

export const transient = <TInstance>(defineFn: DefineClbk<TInstance, LifeTime.transient, {}>) => {
  return new InstanceDefinition(v4(), LifeTime.transient, defineFn);
};

export const scoped = <TInstance>(defineFn: DefineClbk<TInstance, LifeTime.scoped, {}>) => {
  return new InstanceDefinition(v4(), LifeTime.scoped, defineFn);
};
