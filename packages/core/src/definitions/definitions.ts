import { LifeTime } from './abstract/LifeTime.js';
import { DefineClbk } from '../builder/buildDefine.js';
import { InstanceDefinition } from './abstract/sync/InstanceDefinition.js';
import { v4 } from 'uuid';

export const singleton = <TInstance>(defineFn: DefineClbk<LifeTime.singleton, {}, TInstance>) => {
  return new InstanceDefinition(v4(), LifeTime.singleton, defineFn);
};

export const transient = <TInstance>(defineFn: DefineClbk<LifeTime.transient, {}, TInstance>) => {
  return new InstanceDefinition(v4(), LifeTime.transient, defineFn);
};

export const scoped = <TInstance>(defineFn: DefineClbk<LifeTime.scoped, {}, TInstance>) => {
  return new InstanceDefinition(v4(), LifeTime.scoped, defineFn);
};
