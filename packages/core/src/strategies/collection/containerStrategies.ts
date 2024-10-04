import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import { SingletonStrategy } from '../SingletonStrategy.js';
import { TransientStrategy } from '../TransientStrategy.js';
import { ScopeStrategy } from '../ScopeStrategy.js';

export const containerStrategies = {
  [LifeTime.singleton]: new SingletonStrategy(),
  [LifeTime.transient]: new TransientStrategy(),
  [LifeTime.scoped]: new ScopeStrategy(),
};
