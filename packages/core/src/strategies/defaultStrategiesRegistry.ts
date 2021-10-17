import { StrategiesRegistry } from './collection/StrategiesRegistry';
import { LifeTime } from '../definitions/abstract/LifeTime';
import { SingletonStrategy } from './sync/SingletonStrategy';
import { TransientStrategy } from './sync/TransientStrategy';
import { RequestStrategy } from './sync/RequestStrategy';
import { ScopeStrategy } from './sync/ScopeStrategy';

export const defaultStrategiesRegistry = new StrategiesRegistry({
  [LifeTime.singleton]: new SingletonStrategy(),
  [LifeTime.transient]: new TransientStrategy(),
  [LifeTime.request]: new RequestStrategy(),
  [LifeTime.scoped]: new ScopeStrategy(),
});
