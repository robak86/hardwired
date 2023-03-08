import { StrategiesRegistry } from './StrategiesRegistry.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import { SingletonStrategy } from '../SingletonStrategy.js';
import { TransientStrategy } from '../TransientStrategy.js';
import { ScopeStrategy } from '../ScopeStrategy.js';

export const defaultStrategiesRegistry = new StrategiesRegistry({
  [LifeTime.singleton]: new SingletonStrategy(),
  [LifeTime.transient]: new TransientStrategy(),
  [LifeTime.scoped]: new ScopeStrategy(),
});
